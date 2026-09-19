import { LanguageCode, RouteStep, StationData } from '../types';
import { MRT_LINE_META } from '../data/translations';

// Localized Line Names for auditory announcements
const LOCALIZED_LINES: Record<LanguageCode, Record<string, string>> = {
  en: {
    NSL: 'North South Line',
    EWL: 'East West Line',
    NEL: 'North East Line',
    CCL: 'Circle Line',
    DTL: 'Downtown Line',
    TEL: 'Thomson-East Coast Line',
    BPLRT: 'Bukit Panjang LRT',
    SKLRT: 'Sengkang LRT',
    PGLRT: 'Punggol LRT',
  },
  zh: {
    NSL: '南北线',
    EWL: '东西线',
    NEL: '东北线',
    CCL: '环线',
    DTL: '滨海市区线',
    TEL: '汤申-东海岸线',
    BPLRT: '武吉班让轻轨',
    SKLRT: '盛港轻轨',
    PGLRT: '榜鹅轻轨',
  },
  ms: {
    NSL: 'Laluan North South',
    EWL: 'Laluan East West',
    NEL: 'Laluan North East',
    CCL: 'Laluan Circle',
    DTL: 'Laluan Downtown',
    TEL: 'Laluan Thomson-East Coast',
    BPLRT: 'LRT Bukit Panjang',
    SKLRT: 'LRT Sengkang',
    PGLRT: 'LRT Punggol',
  },
  ta: {
    NSL: 'வடக்கு தெற்கு ரயில்பாதை',
    EWL: 'கிழக்கு மேற்கு ரயில்பாதை',
    NEL: 'வடகிழக்கு ரயில்பாதை',
    CCL: 'வட்டப் பாதை',
    DTL: 'டவுன்டவுன் ரயில்பாதை',
    TEL: 'தாம்சன்-ஈஸ்ட் கோஸ்ட் ரயில்பாதை',
    BPLRT: 'புக்கிட் பாஞ்சாங் எல்ஆர்டி',
    SKLRT: 'செங்காங் எல்ஆர்டி',
    PGLRT: 'பொங்கோல் எல்ஆர்டி',
  },
  my: {
    NSL: 'မြောက်-တောင် ရထားလိုင်း',
    EWL: 'အရှေ့-အနောက် ရထားလိုင်း',
    NEL: 'အရှေ့မြောက် ရထားလိုင်း',
    CCL: 'စက်ဝိုင်း ရထားလိုင်း',
    DTL: 'ဒေါင်းတောင်း ရထားလိုင်း',
    TEL: 'သော်မဆင်-အရှေ့ဘက်ကမ်းခြေ ရထားလိုင်း',
    BPLRT: 'ဘူကစ်ပန်ဂျန်း LRT',
    SKLRT: 'ဆန်ကန်း LRT',
    PGLRT: 'ပွန်ဂို LRT',
  },
};

export class VoiceService {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  private static currentAudio: HTMLAudioElement | null = null;
  private static isSpeaking = false;
  private static isPaused = false;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static stateListeners: Set<() => void> = new Set();

  public static subscribe(listener: () => void): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private static notifyListeners() {
    this.stateListeners.forEach((fn) => {
      try { fn(); } catch {}
    });
  }

  public static isSpeakingState(): boolean {
    return this.isSpeaking;
  }

  public static isPausedState(): boolean {
    return this.isPaused;
  }

  static {
    // Cache browser voices as soon as they become available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          VoiceService.cachedVoices = window.speechSynthesis.getVoices();
        } catch (e) {
          // ignore
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Get all currently loaded voices
   */
  public static getVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && this.synth) {
      try {
        this.cachedVoices = this.synth.getVoices();
      } catch (e) {
        // ignore
      }
    }
    return this.cachedVoices;
  }

  /**
   * Check whether the user's browser/OS has a native TTS engine installed for the language
   */
  public static hasNativeVoice(lang: LanguageCode): boolean {
    const voices = this.getVoices();
    if (lang === 'ta') {
      return voices.some(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar')
      );
    }
    if (lang === 'my') {
      return voices.some(
        (v) =>
          v.lang.toLowerCase().startsWith('my') ||
          v.name.toLowerCase().includes('burmese') ||
          v.name.toLowerCase().includes('myanmar')
      );
    }
    return voices.some((v) => v.lang.toLowerCase().startsWith(lang));
  }

  /**
   * Get localized station name based on selected app language
   */
  public static getLocalizedStationName(st: StationData, lang: LanguageCode): string {
    switch (lang) {
      case 'zh':
        return st.nameZh || st.name;
      case 'ms':
        return st.nameMs || st.name;
      case 'ta':
        return st.nameTa || st.name;
      case 'my':
        return st.nameMy || st.name;
      default:
        return st.name;
    }
  }

  /**
   * Get localized line name based on selected app language
   */
  public static getLocalizedLineName(lineCode: string, lang: LanguageCode): string {
    return LOCALIZED_LINES[lang]?.[lineCode] || MRT_LINE_META[lineCode]?.name || lineCode;
  }

  /**
   * Format comprehensive turn-by-turn guidance in native script for UI display & server TTS.
   */
  public static formatGuidanceSpeech(
    step: RouteStep,
    idx: number,
    total: number,
    lang: LanguageCode
  ): string {
    const fromName = this.getLocalizedStationName(step.fromStation, lang);
    const toName = this.getLocalizedStationName(step.toStation, lang);
    const lineName = this.getLocalizedLineName(step.line, lang);
    const isFirst = idx === 0;
    const isLast = idx === total - 1;
    const car = step.recommendedCar || 1;
    const minutes = step.time;

    switch (lang) {
      case 'zh': {
        let speech = `第 ${idx + 1} 步，共 ${total} 步。`;
        if (isFirst) {
          speech += `从 ${fromName} 出发。请搭乘 ${lineName} 前往 ${toName}。`;
        } else {
          speech += `在 ${fromName}，换乘 ${lineName} 前往 ${toName}。`;
        }
        speech += `预计车程约 ${minutes} 分钟。`;
        speech += `建议前往第 ${car} 节车厢，空间更宽敞舒适。`;
        if (step.doorNote) {
          speech += `站台 1 号或 6 号门客流较少。`;
        }
        if (isLast) {
          speech += `在 ${toName} 下车。站台中央设有无障碍电梯通往地面出口。祝您出行愉快！`;
        }
        return speech;
      }

      case 'ms': {
        let speech = `Langkah ${idx + 1} daripada ${total}. `;
        if (isFirst) {
          speech += `Bermula di Stesen ${fromName}. Sila naiki ${lineName} menghala ke Stesen ${toName}. `;
        } else {
          speech += `Dari Stesen ${fromName}, teruskan menaiki ${lineName} ke Stesen ${toName}. `;
        }
        speech += `Anggaran masa perjalanan adalah ${minutes} minit. `;
        speech += `Disyorkan menaiki Gerabak ${car} untuk keselesaan optimum dan akses mudah. `;
        if (step.doorNote) {
          speech += `Pintu platform 1 atau 6 untuk mengelakkan kesesakan. `;
        }
        if (isLast) {
          speech += `Sila turun di Stesen ${toName}. Lif tanpa tangga ke pintu keluar jalan raya tersedia di bahagian tengah platform. Selamat sampai ke destinasi!`;
        }
        return speech;
      }

      case 'ta': {
        let speech = `படி ${idx + 1}, மொத்தம் ${total} படிகள். `;
        if (isFirst) {
          speech += `${fromName} நிலையத்திலிருந்து தொடங்குகிறது. ${toName} நோக்கி ${lineName} ரயிலில் ஏறவும். `;
        } else {
          speech += `${fromName} நிலையத்திலிருந்து, ${toName} நோக்கி ${lineName} ரயிலில் தொடரவும். `;
        }
        speech += `பயண நேரம் சுமார் ${minutes} நிமிடங்கள். `;
        speech += `சௌகரியமான பயணத்திற்கு பெட்டி ${car}-ல் ஏற பரிந்துரைக்கப்படுகிறது. `;
        if (step.doorNote) {
          speech += `குறைந்த கூட்டத்திற்கு பிளாட்பார்ம் கதவு 1 அல்லது 6-ஐ பயன்படுத்தவும். `;
        }
        if (isLast) {
          speech += `${toName} நிலையத்தில் இறங்கவும். பிளாட்பாரத்தின் நடுவில் லிப்ட் வசதி உள்ளது. பயணம் நிறைவடைந்தது!`;
        }
        return speech;
      }

      case 'my': {
        let speech = `အဆင့် ${idx + 1} (စုစုပေါင်း ${total} ဆင့်)။ `;
        if (isFirst) {
          speech += `${fromName} ဘူတာမှ စတင်ပါ။ ${toName} သို့ ဦးတည်သော ${lineName} ကို စီးနင်းပါ။ `;
        } else {
          speech += `${fromName} ဘူတာတွင် ${toName} ဘက်သို့ ဦးတည်သော ${lineName} ကို ဆက်လက်စီးနင်းပါ။ `;
        }
        speech += `ခရီးစဉ်ကြာချိန် ခန့်မှန်းခြေ ${minutes} မိနစ် ဖြစ်ပါသည်။ `;
        speech += `ပိုမိုသက်တောင့်သက်သာရှိစေရန် ရထားတွဲ အမှတ် ${car} တွင် စီးနင်းရန် အကြံပြုပါသည်။ `;
        if (step.doorNote) {
          speech += `လူဦးရေ အနည်းဆုံးဖြစ်သော တံခါး ၁ သို့မဟုတ် ၆ တွင် တက်ရောက်ပါ။ `;
        }
        if (isLast) {
          speech += `${toName} ဘူတာတွင် ဆင်းပါ။ ပလက်ဖောင်းအလယ်တွင် ဓာတ်လှေကား အဆင်သင့်ရှိပါသည်။ ဘေးကင်းလုံခြုံသော ခရီးစဉ် ဖြစ်ပါစေ။`;
        }
        return speech;
      }

      default: {
        let speech = `Step ${idx + 1} of ${total}. `;
        if (isFirst) {
          speech += `Starting at ${fromName} Station. Board the ${lineName} towards ${toName}. `;
        } else {
          speech += `From ${fromName}, continue on the ${lineName} towards ${toName}. `;
        }
        speech += `Travel time is approximately ${minutes} minutes. `;
        speech += `Board Carriage ${car} for optimal comfort and space. `;
        if (step.doorNote) {
          speech += `${step.doorNote}. `;
        }
        if (isLast) {
          speech += `Alight at ${toName} Station. Step-free elevator to the street exit is accessible at platform center. Have a pleasant and safe journey!`;
        }
        return speech;
      }
    }
  }

  /**
   * Phonetic fallback guidance text. Used when the client device's browser lacks
   * native Tamil or Burmese TTS voice packs, ensuring clear auditory output without errors.
   */
  public static formatPhoneticGuidance(
    step: RouteStep,
    idx: number,
    total: number,
    lang: LanguageCode
  ): string {
    const from = step.fromStation.name;
    const to = step.toStation.name;
    const line = MRT_LINE_META[step.line]?.name || step.line;
    const car = step.recommendedCar || 1;
    const minutes = step.time;
    const isFirst = idx === 0;
    const isLast = idx === total - 1;

    if (lang === 'ta') {
      let s = `Padi ${idx + 1}, moththam ${total} padigal. `;
      if (isFirst) {
        s += `${from} nilaiyathilirundhu thodangugiradhu. ${to} nokki ${line} rayilil yeravum. `;
      } else {
        s += `${from} nilaiyathilirundhu, ${to} nokki ${line} rayilil thodaravum. `;
      }
      s += `Payana neram sumaar ${minutes} nimidangal. `;
      s += `Soukariyamaana payanathirkku petti ${car}-il yera parindhuraikkappadugiradhu. `;
      if (step.doorNote) {
        s += `Platform kadhavu 1 alladhu 6-ai payanpaduthavum. `;
      }
      if (isLast) {
        s += `${to} nilaiyathil irangavum. Platform naduvil lift vasadhi ulladhu. Payanam niraivadaindhadhu!`;
      }
      return s;
    }

    if (lang === 'my') {
      let s = `Ah-sint ${idx + 1}, su-su-paung ${total} sint. `;
      if (isFirst) {
        s += `${from} bota hma sa-tin-par. ${to} tho oo-tee thaw ${line} go see-nin-par. `;
      } else {
        s += `${from} bota twin, ${to} tho oo-tee thaw ${line} go set-let see-nin-par. `;
      }
      s += `Kha-yee-sin kyar-chein khant-mhan-chay ${minutes} mi-nit phit-par-thee. `;
      s += `Po-mo thet-tawng-thet-tha shi-say-ran ya-htar-twe ah-hmat ${car} twin see-nin-ran ah-kyan-pyu-par-thee. `;
      if (step.doorNote) {
        s += `Tan-khar 1 tho-ma-hote 6 twin tet-yawk-par. `;
      }
      if (isLast) {
        s += `${to} bota twin hsin-par. Platform ah-lal twin dhat-hlay-ka ah-sint-thint shi-par-thee. Kha-yee-sin pee-sone-par-pee!`;
      }
      return s;
    }

    return this.formatGuidanceSpeech(step, idx, total, lang);
  }

  /**
   * Localized station audio announcement
   */
  public static formatStationAnnouncement(
    st: StationData,
    lineName: string,
    lang: LanguageCode
  ): string {
    const locName = this.getLocalizedStationName(st, lang);
    const codes = st.codes.join(', ');

    switch (lang) {
      case 'zh':
        return `${locName}站。车站代码 ${codes}。属于${lineName}。全站配备无障碍直梯与轮椅通道。`;
      case 'ms':
        return `Stesen ${locName}. Kod stesen ${codes}. Laluan ${lineName}. Dilengkapi lif tanpa tangga dan laluan kerusi roda.`;
      case 'ta':
        return `${locName} நிலையம். நிலைய குறியீடு ${codes}. ${lineName}. படிக்கட்டுகளற்ற லிப்ட் மற்றும் சக்கர நாற்காலி அணுகல் வசதி உள்ளது.`;
      case 'my':
        return `${locName} ဘူတာ။ ဘူတာကုဒ် ${codes}။ ${lineName}။ ဓာတ်လှေကားနှင့် ဘီးတပ်ကုလားထိုင် အလွယ်တကူ သွားလာနိုင်ပါသည်။`;
      default:
        return `${locName} Station. Station codes ${codes}. On the ${lineName}. Step-free elevator and wheelchair accessible.`;
    }
  }

  /**
   * Phonetic fallback for station tap announcements when native voice is missing
   */
  public static formatPhoneticStationAnnouncement(
    st: StationData,
    lineName: string,
    lang: LanguageCode
  ): string {
    const codes = st.codes.join(', ');
    if (lang === 'ta') {
      return `${st.name} nilaiyam. Station code ${codes}. ${lineName}. Lift and wheelchair access vasadhi ulladhu.`;
    }
    if (lang === 'my') {
      return `${st.name} bota. Station code ${codes}. ${lineName}. Dhat-hlay-ka hpyint ah-lwal-ta-ku thwar-lar naing-par-thee.`;
    }
    return this.formatStationAnnouncement(st, lineName, lang);
  }

  /**
   * Format voice destination feedback
   */
  public static formatDestinationSpeech(stationName: string, lang: LanguageCode): string {
    switch (lang) {
      case 'zh':
        return `正在将目的地设为 ${stationName} 站。为您计算无障碍最佳路线。`;
      case 'ms':
        return `Menetapkan destinasi ke Stesen ${stationName}. Sedang mengira laluan mudah akses.`;
      case 'ta':
        return `${stationName} நிலையத்திற்கு இலக்கு அமைக்கப்பட்டது. சிறந்த வழித்தடம் கணக்கிடப்படுகிறது.`;
      case 'my':
        return `${stationName} ဘူတာသို့ ဦးတည်ရာ သတ်မှတ်လိုက်ပါပြီ။ အကောင်းဆုံးလမ်းကြောင်း တွက်ချက်နေပါသည်။`;
      default:
        return `Setting destination to ${stationName} Station. Calculating your accessible route.`;
    }
  }

  /**
   * Phonetic fallback for destination speech
   */
  public static formatPhoneticDestinationSpeech(stationName: string, lang: LanguageCode): string {
    if (lang === 'ta') {
      return `${stationName} nilaiyathirkku ilakku amaikkappattadhu. Route calculate seyyappadugiradhu.`;
    }
    if (lang === 'my') {
      return `${stationName} bota tho oo-tee-yar that-hmat-like-par-pee.`;
    }
    return this.formatDestinationSpeech(stationName, lang);
  }

  /**
   * Primary Speech Function:
   * Uses client-side Web Speech Synthesis as the primary, instantaneous, offline-ready,
   * zero-quota voice engine across all 5 languages (English, Chinese, Malay, Tamil, and Burmese).
   * For Tamil and Burmese: if local browser lacks native language voice pack, automatically speaks
   * phonetic transliterations so speech NEVER throws errors, exhausts API quotas, or goes silent!
   */
  public static speak(
    text: string,
    lang: LanguageCode = 'en',
    onEnd?: () => void,
    phoneticFallback?: string
  ) {
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    this.isPaused = false;
    this.notifyListeners();

    // Instantaneous, zero-quota, offline-capable local synthesis
    this.speakViaLocalSynth(cleanText, lang, onEnd, phoneticFallback);
  }

  /**
   * Server-Side Gemini Natural Audio (generates real WAV audio for any language)
   */
  private static async speakViaServerTts(
    text: string,
    lang: LanguageCode,
    onEnd?: () => void
  ): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`TTS API status ${res.status}`);
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('No audio returned from server');
      }

      // Decode base64 standard WAV audio
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = 0.95;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isSpeaking = false;
        throw new Error('Audio element error');
      };

      await audio.play();
    } catch (e: any) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  /**
   * Client-side Web Speech Synthesis:
   * Handles native script when voice is present, and gracefully handles phonetic speech
   * when Tamil or Burmese voice packs are not installed on the user's OS.
   */
  private static speakViaLocalSynth(
    text: string,
    lang: LanguageCode,
    onEnd?: () => void,
    phoneticFallback?: string
  ) {
    if (!this.synth) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();

      const voices = this.getVoices();
      const hasNativeVoice = this.hasNativeVoice(lang);

      // Determine text to speak
      let textToSpeak = text;
      let targetLang = lang === 'en' ? 'en-SG' : lang;

      // If user chose Tamil or Burmese but their browser has no voice for it,
      // speak the phonetic version so it sounds clear, intelligible, and never fails!
      if ((lang === 'ta' || lang === 'my') && !hasNativeVoice) {
        textToSpeak = phoneticFallback || this.transliterateToPhonetic(text, lang);
        targetLang = 'en-SG'; // Use clear English/Singapore vocal engine to pronounce phonetic text
      }

      // Clean abbreviations
      textToSpeak = textToSpeak
        .replace(/\bMRT\b/g, 'M R T')
        .replace(/\bLRT\b/g, 'L R T')
        .replace(/\bEWL\b/g, 'East West Line')
        .replace(/\bNSL\b/g, 'North South Line')
        .replace(/\bNEL\b/g, 'North East Line')
        .replace(/\bCCL\b/g, 'Circle Line')
        .replace(/\bDTL\b/g, 'Downtown Line')
        .replace(/\bTEL\b/g, 'Thomson East Coast Line');

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Moderate pace (0.88x) for clear comprehension across children (6) to seniors (90+)
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      // Match best voice
      const selectedVoice = this.pickBestVoice(voices, lang, hasNativeVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = targetLang;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notifyListeners();
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        // 'interrupted' and 'canceled' occur naturally when user taps to next step or stops audio
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.log('Speech synthesis note:', e.error);
        }
        this.isSpeaking = false;
        this.isPaused = false;
        this.notifyListeners();
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis exception:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  /**
   * Transliterate any ad-hoc Tamil or Burmese transit text into smooth phonetics
   */
  private static transliterateToPhonetic(text: string, lang: LanguageCode): string {
    if (lang === 'ta') {
      return text
        .replace(/படி/g, 'Padi')
        .replace(/மொத்தம்/g, 'moththam')
        .replace(/படிகள்/g, 'padigal')
        .replace(/நிலையத்திலிருந்து/g, 'nilaiyathilirundhu')
        .replace(/தொடங்குகிறது/g, 'thodangugiradhu')
        .replace(/ரயிலில்/g, 'rayilil')
        .replace(/ஏறவும்/g, 'yeravum')
        .replace(/பயண நேரம்/g, 'payana neram')
        .replace(/நிமிடங்கள்/g, 'nimidangal')
        .replace(/பெட்டி/g, 'petti')
        .replace(/இறங்கவும்/g, 'irangavum')
        .replace(/லிப்ட்/g, 'lift')
        .replace(/வசதி உள்ளது/g, 'vasadhi ulladhu')
        .replace(/பயணம் நிறைவடைந்தது/g, 'payanam niraivadaindhadhu');
    }
    if (lang === 'my') {
      return text
        .replace(/အဆင့်/g, 'Ah-sint')
        .replace(/စုစုပေါင်း/g, 'su-su-paung')
        .replace(/ဆင့်/g, 'sint')
        .replace(/ဘူတာမှ/g, 'bota hma')
        .replace(/စတင်ပါ။/g, 'sa-tin-par.')
        .replace(/စီးနင်းပါ။/g, 'see-nin-par.')
        .replace(/ခရီးစဉ်ကြာချိန်/g, 'Kha-yee-sin kyar-chein')
        .replace(/မိနစ်/g, 'mi-nit')
        .replace(/ရထားတွဲ/g, 'ya-htar-twe')
        .replace(/ဆင်းပါ။/g, 'hsin-par.')
        .replace(/ဓာတ်လှေကား/g, 'dhat-hlay-ka')
        .replace(/ခရီးစဉ် ပြီးဆုံးပါပြီ/g, 'kha-yee-sin pee-sone-par-pee');
    }
    return text;
  }

  /**
   * Intelligently select the best matching voice
   */
  private static pickBestVoice(
    voices: SpeechSynthesisVoice[],
    lang: LanguageCode,
    hasNativeVoice: boolean
  ): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;

    const naturalKeywords = ['natural', 'google', 'neural', 'siri', 'premium', 'online', 'enhanced'];

    // If native voice exists for Tamil
    if (lang === 'ta' && hasNativeVoice) {
      const taVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar') ||
          v.name.toLowerCase().includes('latha')
      );
      if (taVoice) return taVoice;
    }

    // If native voice exists for Burmese
    if (lang === 'my' && hasNativeVoice) {
      const myVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('my') ||
          v.name.toLowerCase().includes('burmese') ||
          v.name.toLowerCase().includes('myanmar')
      );
      if (myVoice) return myVoice;
    }

    // For Chinese
    if (lang === 'zh') {
      const zhVoice = voices.find((v) =>
        /xiaoxiao|yunxi|ting-ting|sinji|mei-jia|huihui|mandarin|chinese/i.test(v.name)
      );
      if (zhVoice) return zhVoice;
      const zhLangVoice = voices.find((v) => v.lang.toLowerCase().startsWith('zh'));
      if (zhLangVoice) return zhLangVoice;
    }

    // For Malay
    if (lang === 'ms') {
      const msVoice = voices.find((v) =>
        /gadis|andika|indonesia|melayu|malay/i.test(v.name)
      );
      if (msVoice) return msVoice;
      const msLangVoice = voices.find(
        (v) => v.lang.toLowerCase().startsWith('ms') || v.lang.toLowerCase().startsWith('id')
      );
      if (msLangVoice) return msLangVoice;
    }

    // For English or phonetic fallback: pick high-quality natural/neural English voice (Singapore or international)
    const sgVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes('en-sg') &&
        naturalKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (sgVoice) return sgVoice;

    const naturalEnVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') &&
        naturalKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (naturalEnVoice) return naturalEnVoice;

    // Any English voice
    const anyEnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (anyEnVoice) return anyEnVoice;

    return voices[0] || null;
  }

  /**
   * Pause all audio and speech playback immediately
   */
  public static pause() {
    this.isPaused = true;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch (e) {
        // ignore
      }
    }

    if (this.synth) {
      try {
        this.synth.pause();
      } catch (e) {
        // ignore
      }
    }

    this.notifyListeners();
  }

  /**
   * Resume paused audio or speech playback
   */
  public static resume() {
    this.isPaused = false;

    if (this.currentAudio && this.currentAudio.paused) {
      try {
        this.currentAudio.play();
      } catch (e) {
        // ignore
      }
    }

    if (this.synth && this.synth.paused) {
      try {
        this.synth.resume();
      } catch (e) {
        // ignore
      }
    }

    this.notifyListeners();
  }

  /**
   * Stop all audio and speech playback immediately
   */
  public static stop() {
    this.isSpeaking = false;
    this.isPaused = false;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }

    this.notifyListeners();
  }

  /**
   * Hands-free speech recognition in user's active language
   */
  public static createSpeechRecognizer(
    lang: LanguageCode = 'en',
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): any {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap: Record<LanguageCode, string> = {
        en: 'en-SG',
        zh: 'zh-CN',
        ms: 'ms-MY',
        ta: 'ta-IN',
        my: 'my-MM',
      };

      recognition.lang = langMap[lang] || 'en-SG';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.onend = () => {
        onEnd();
      };

      return recognition;
    } catch (e) {
      onError(e);
      return null;
    }
  }

  /**
   * Parse natural language voice commands
   */
  public static parseVoiceCommand(text: string): {
    action: string;
    stationName?: string;
  } {
    const lower = (text || '').toLowerCase();

    if (
      lower.includes('go to') ||
      lower.includes('to ') ||
      lower.includes('去') ||
      lower.includes('到') ||
      lower.includes('pergi ke') ||
      lower.includes('menuju ke') ||
      lower.includes('செல்லவும்') ||
      lower.includes('போக வேண்டும்') ||
      lower.includes('သွားမယ်') ||
      lower.includes('သွားရန်')
    ) {
      const parts = lower.split(/go to|to|去|到|pergi ke|menuju ke|செல்லவும்|போக வேண்டும்|သွားမယ်|သွားရန်/);
      const target = parts[parts.length - 1].trim();
      return { action: 'set_destination', stationName: target };
    }

    if (
      lower.includes('carriage') ||
      lower.includes('car') ||
      lower.includes('crowd') ||
      lower.includes('车厢') ||
      lower.includes('拥挤') ||
      lower.includes('gerabak') ||
      lower.includes('sesak') ||
      lower.includes('பெட்டி') ||
      lower.includes('கூட்டம்') ||
      lower.includes('ရထားတွဲ')
    ) {
      return { action: 'view_carriages' };
    }

    if (
      lower.includes('quiet') ||
      lower.includes('low sensory') ||
      lower.includes('calm') ||
      lower.includes('安静') ||
      lower.includes('低感官') ||
      lower.includes('tenang') ||
      lower.includes('அமைதியான') ||
      lower.includes('ဆိတ်ငြိမ်')
    ) {
      return { action: 'toggle_sensory' };
    }

    if (
      lower.includes('wheelchair') ||
      lower.includes('lift') ||
      lower.includes('step free') ||
      lower.includes('barrier free') ||
      lower.includes('轮椅') ||
      lower.includes('电梯') ||
      lower.includes('无障碍') ||
      lower.includes('lif') ||
      lower.includes('kerusi roda') ||
      lower.includes('லிப்ட்') ||
      lower.includes('சக்கர நாற்காலி') ||
      lower.includes('ဓာတ်လှေကား') ||
      lower.includes('ဘီးတပ်ကုလားထိုင်')
    ) {
      return { action: 'toggle_mobility' };
    }

    if (
      lower.includes('contrast') ||
      lower.includes('high contrast') ||
      lower.includes('对比度') ||
      lower.includes('高对比') ||
      lower.includes('kontras') ||
      lower.includes('வித்தியாசம்') ||
      lower.includes('မျက်စိရှင်း')
    ) {
      return { action: 'toggle_contrast' };
    }

    if (
      lower.includes('offline') ||
      lower.includes('tunnel') ||
      lower.includes('map') ||
      lower.includes('离线') ||
      lower.includes('地底') ||
      lower.includes('luar talian') ||
      lower.includes('ஆஃப்லைன்') ||
      lower.includes('မြေပုံ')
    ) {
      return { action: 'toggle_offline' };
    }

    return { action: 'general_query' };
  }
}
