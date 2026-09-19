import React from 'react';
import { Volume2, AlertTriangle, ArrowRight, CornerDownRight, CheckCircle2, Accessibility, Footprints, Bike, Train, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { CalculatedRoute, ContrastMode, DoorToDoorLeg, LanguageCode, MRTLineCode, ProactiveDecisionSupport, StationData } from '../types';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { VoiceService } from '../utils/speech';
import { ALL_STATIONS } from '../data/mrtData';

interface RouteDiagramProps {
  route: CalculatedRoute;
  onSelectStation?: (stationId: string) => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  onApplyAlternative?: () => void;
}

export const getLocalizedLineName = (code: string, lang: LanguageCode): string => {
  const lineNamesMap: Record<string, Record<LanguageCode, string>> = {
    NSL: { en: 'North South Line', zh: '南北线', ms: 'Laluan Utara Selatan', ta: 'வடக்கு தெற்கு வழித்தடம்', my: 'မြောက်တောင်ရထားလိုင်း' },
    EWL: { en: 'East West Line', zh: '东西线', ms: 'Laluan Timur Barat', ta: 'கிழக்கு மேற்கு வழித்தடம்', my: 'အရှေ့အနောက်ရထားလိုင်း' },
    NEL: { en: 'North East Line', zh: '东北线', ms: 'Laluan Timur Laut', ta: 'வடகிழக்கு வழித்தடம்', my: 'အရှေ့မြောက်ရထားလိုင်း' },
    CCL: { en: 'Circle Line', zh: '环线', ms: 'Laluan Bulatan', ta: 'வட்ட வழித்தடம்', my: 'စက်ဝိုင်းရထားလိုင်း' },
    DTL: { en: 'Downtown Line', zh: '滨海市区线', ms: 'Laluan Downtown', ta: 'டவுன்டவுன் வழித்தடம்', my: 'ဒေါင်းတောင်းရထားလိုင်း' },
    TEL: { en: 'Thomson-East Coast Line', zh: '汤申-东海岸线', ms: 'Laluan Thomson-East Coast', ta: 'தாம்சன்-கிழக்கு கடற்கரை வழித்தடம்', my: 'သွန်ဆင်-အရှေ့ဘက်ကမ်းရထားလိုင်း' },
    BPLRT: { en: 'Bukit Panjang LRT', zh: '武吉班让轻轨', ms: 'LRT Bukit Panjang', ta: 'புக்கிட் பாஞ்சாங் LRT', my: 'ဘူကစ်ပန်ဂျန်း LRT' },
    SKLRT: { en: 'Sengkang LRT', zh: '盛港轻轨', ms: 'LRT Sengkang', ta: 'செங்காங் LRT', my: 'ဆန်ကန်း LRT' },
    PGLRT: { en: 'Punggol LRT', zh: '榜鹅轻轨', ms: 'LRT Punggol', ta: 'பொங்கோல் LRT', my: 'ပွန်ဂိုးလ် LRT' },
  };
  return lineNamesMap[code]?.[lang] || MRT_LINE_META[code]?.name || code;
};

export const RouteDiagram: React.FC<RouteDiagramProps> = ({
  route,
  onSelectStation,
  language,
  contrastMode,
  onApplyAlternative,
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const getStationDisplayName = (st: StationData) => {
    if (language === 'zh' && st.nameZh) return `${st.name} (${st.nameZh})`;
    if (language === 'ms' && st.nameMs) return st.nameMs;
    if (language === 'ta' && st.nameTa) return `${st.name} (${st.nameTa})`;
    if (language === 'my' && st.nameMy) return `${st.name} (${st.nameMy})`;
    return st.name;
  };

  const readStationAloud = (st: StationData, lineName: string) => {
    const speechText = VoiceService.formatStationAnnouncement(st, lineName, language);
    const phonetic = VoiceService.formatPhoneticStationAnnouncement(st, lineName, language);
    VoiceService.speak(speechText, language, undefined, phonetic);
  };

  // Localized Proactive Decision
  const getLocalizedProactiveDecision = (decision: ProactiveDecisionSupport) => {
    if (decision.actionType === 'reroute') {
      const headlines: Record<LanguageCode, string> = {
        en: 'Proactive Disruption Warning',
        zh: '突发延误智能预警',
        ms: 'Amaran Gangguan Proaktif',
        ta: 'முன்னெச்சரிக்கை தடங்கல் எச்சரிக்கை',
        my: 'ကြိုတင်သတိပေးချက် နှောင့်နှေးမှု',
      };
      const reasons: Record<LanguageCode, string> = {
        en: decision.reason,
        zh: '路线前方路段报告出现列车或信号延误，预计影响行程。',
        ms: 'Kelewatan tren aktif dilaporkan di hadapan koridor ini.',
        ta: 'செயலில் உள்ள ரயில் தாமதம் இந்த வழித்தடத்தில் பதிவாகியுள்ளது.',
        my: 'ဤလမ်းကြောင်းတွင် ရထားနှောင့်နှေးမှု ဖြစ်ပွားနေပါသည်။',
      };
      const actions: Record<LanguageCode, string> = {
        en: 'Take Downtown Line (DTL) / Thomson-East Coast Line bypass route to stay on schedule.',
        zh: '建议改乘市区线 (DTL) 或汤申-东海岸线 (TEL) 绕行路线，准时到达。',
        ms: 'Gunakan laluan pintasan Laluan Downtown (DTL) / Laluan Thomson-East Coast untuk kekal tepat masa.',
        ta: 'திட்டமிட்டபடி சென்றடைய Downtown Line (DTL) / Thomson-East Coast Line வழியைப் பயன்படுத்தவும்.',
        my: 'အချိန်မီရောက်ရှိရန် Downtown Line (DTL) သို့မဟုတ် Thomson-East Coast Line ဖြင့် သွားပါ။',
      };
      return {
        headline: headlines[language] || decision.headline,
        reason: reasons[language] || decision.reason,
        recommendedAction: actions[language] || decision.recommendedAction,
      };
    } else if (decision.actionType === 'wait') {
      const headlines: Record<LanguageCode, string> = {
        en: 'Comfort & Crowd Departure Recommendation',
        zh: '舒适错峰出行建议',
        ms: 'Cadangan Pelepasan Selesa & Kurang Sesak',
        ta: 'வசதியான & கூட்ட நெரிசலற்ற பயணப் பரிந்துரை',
        my: 'သက်တောင့်သက်သာ လူမရှုပ်သည့် အချိန်ထွက်ခွာရန် အကြံပြုချက်',
      };
      const reasons: Record<LanguageCode, string> = {
        en: 'Current station platform is in high peak rush (Crowd Level H).',
        zh: '当前车站站台处于高峰拥挤时段（拥挤度 H）。',
        ms: 'Platform stesen kini berada pada waktu puncak yang sesak (Tahap Kesesakan H).',
        ta: 'தற்போதைய ரயில் நிலைய நடைமேடையில் அதிக நெரிசல் உள்ளது (நெரிசல் நிலை H).',
        my: 'လက်ရှိဘူတာရုံပလက်ဖောင်းတွင် လူအလွန်ရှုပ်ထွေးနေပါသည် (လူထူထပ်မှုအဆင့် H)။',
      };
      const mins = decision.targetDepartureDeltaMins || 20;
      const actions: Record<LanguageCode, string> = {
        en: `Depart in ${mins} mins to enjoy Crowd Level L with guaranteed seating and bicycle bay space.`,
        zh: `建议在 ${mins} 分钟后出发，享受低拥挤度（L 级），空座充裕且有充足自行车放置位。`,
        ms: `Bertolak dalam masa ${mins} minit untuk menikmati Tahap Kesesakan L dengan tempat duduk terjamin.`,
        ta: `உறுதிசெய்யப்பட்ட இருக்கைகளுடன் வசதியாக பயணிக்க ${mins} நிமிடங்களில் புறப்படவும்.`,
        my: `ထိုင်ခုံသေချာစေရန်နှင့် သက်တောင့်သက်သာရှိစေရန် ${mins} မိနစ်အကြာတွင် ထွက်ခွာပါ။`,
      };
      return {
        headline: headlines[language] || decision.headline,
        reason: reasons[language] || decision.reason,
        recommendedAction: actions[language] || decision.recommendedAction,
      };
    } else {
      // step_free_lift
      const headlines: Record<LanguageCode, string> = {
        en: '100% Step-Free & Lift Status Verified',
        zh: '100% 无障碍电梯与平层乘车保障',
        ms: '100% Bebas Tangga & Status Lif Disahkan',
        ta: '100% படிக்கட்டுகள் அற்ற நிலை & மின்தூக்கி சரிபார்க்கப்பட்டது',
        my: '၁၀၀% လှေကားထစ်မရှိ ဓာတ်လှေကားအခြေအနေ စစ်ဆေးပြီး',
      };
      const reasons: Record<LanguageCode, string> = {
        en: 'All elevators operational along route; Carriage 3 Door 2 aligns directly with transfer lifts.',
        zh: '沿途所有电梯运转正常；第 3 车厢 2 号门直对换乘无障碍升降机。',
        ms: 'Semua lif beroperasi di sepanjang laluan; Gerabak 3 Pintu 2 sejajar terus dengan lif pertukaran.',
        ta: 'பாதை முழுவதிலும் அனைத்து மின்தூக்கிகளும் இயங்குகின்றன; பெட்டி 3 கதவு 2 மின்தூக்கிக்கு நேராக உள்ளது.',
        my: 'လမ်းကြောင်းတစ်လျှောက် ဓာတ်လှေကားအားလုံး ကောင်းမွန်စွာအလုပ်လုပ်နေပါသည်; ရထားတွဲ ၃ တံခါး ၂ သည် ဓာတ်လှေကားနှင့် တည့်တည့်ဖြစ်ပါသည်။',
      };
      const actions: Record<LanguageCode, string> = {
        en: 'Board Carriage 3 at Door 2 for level boarding without platform gaps.',
        zh: '请在第 3 车厢 2 号门上车，享受与站台齐平、无缝隙的无障碍登车。',
        ms: 'Naik Gerabak 3 di Pintu 2 untuk naik secara rata tanpa jurang platform.',
        ta: 'நடைமேடை இடைவெளி இல்லாமல் எளிதாக ஏற பெட்டி 3 கதவு 2 இல் ஏறவும்.',
        my: 'ပလက်ဖောင်းကွာဟချက်မရှိဘဲ လွယ်ကူစွာတက်နိုင်ရန် ရထားတွဲ ၃ တံခါး ၂ မှ တက်ပါ။',
      };
      return {
        headline: headlines[language] || decision.headline,
        reason: reasons[language] || decision.reason,
        recommendedAction: actions[language] || decision.recommendedAction,
      };
    }
  };

  const getLocalizedSavesText = (mins: number) => {
    switch (language) {
      case 'zh': return `节省 ~${mins} 分钟`;
      case 'ms': return `Jimat ~${mins} minit`;
      case 'ta': return `~${mins} நிமிடங்களைச் சேமிக்கிறது`;
      case 'my': return `~${mins} မိနစ် သက်သာမည်`;
      default: return `Saves ~${mins} mins`;
    }
  };

  const actionPrefix: Record<LanguageCode, string> = {
    en: 'Action:',
    zh: '建议操作：',
    ms: 'Tindakan:',
    ta: 'நடவடிக்கை:',
    my: 'အကြံပြုချက်:',
  };

  const doorToDoorHeader: Record<LanguageCode, string> = {
    en: 'Door-to-Door Journey Breakdown',
    zh: '全程点到点行程规划',
    ms: 'Pecahan Perjalanan Pintu ke Pintu',
    ta: 'வீட்டு வாசல் முதல் இலக்கு வரை பயண விவரம்',
    my: 'အိမ်တံခါးမှ ခရီးစဉ်အပြည့်အစုံ',
  };

  const getLocalizedLegInstruction = (leg: DoorToDoorLeg, index: number): string => {
    if (leg.type === 'walk') {
      if (index === 0) {
        const text: Record<LanguageCode, string> = {
          en: 'Walk 5 mins via fully sheltered covered linkway with tactile paving',
          zh: '步行 5 分钟，全程带盲道指引的有盖风雨连廊直达车站',
          ms: 'Jalan kaki 5 minit melalui laluan berbumbung penuh dengan jubin sentuh ke stesen',
          ta: 'தொடு உணர்வு நடைபாதையுடன் கூடிய கூரையிடப்பட்ட பாதையில் 5 நிமிடங்கள் நடக்கவும்',
          my: 'မျက်မမြင်လမ်းညွှန်ကြမ်းခင်းပါ မိုးလုံလေလုံစင်္ကြံလမ်းမှ ၅ မိနစ်လမ်းလျှောက်ပါ',
        };
        return text[language] || leg.instruction;
      } else {
        const text: Record<LanguageCode, string> = {
          en: 'Use Central Lift Exit F — 100% step-free covered bridge to destination',
          zh: '使用中央升降机 F 出口 — 100% 无障碍全遮盖天桥直达目的地',
          ms: 'Gunakan Lif Utama Pintu F — Jambatan berbumbung 100% tanpa tangga ke destinasi',
          ta: 'மைய மின்தூக்கி வெளியேறு F ஐப் பயன்படுத்தவும் — 100% படிக்கட்டுகள் இல்லாத பாலம்',
          my: 'ဗဟိုဓာတ်လှေကား ထွက်ပေါက် F ကို အသုံးပြုပါ — လှေကားထစ်မရှိ အမိုးပါတံတား',
        };
        return text[language] || leg.instruction;
      }
    } else if (leg.type === 'cycle') {
      const text: Record<LanguageCode, string> = {
        en: 'Ride along Park Connector Network (PCN) directly to covered bicycle bays',
        zh: '沿公园连道 (PCN) 骑行，直达车站有顶棚自行车停放区',
        ms: 'Kayuh sepanjang Rangkaian Penghubung Taman (PCN) terus ke tempat basikal berbumbung',
        ta: 'பூங்கா இணைப்பு நெட்வொர்க் (PCN) வழியாக கூரையிடப்பட்ட மிதிவண்டி நிறுத்தத்திற்கு செல்லவும்',
        my: 'ပန်းခြံဆက်သွယ်ရေးကွန်ရက် (PCN) တစ်လျှောက် မိုးလုံလေလုံစက်ဘီးရပ်နားစခန်းသို့ စီးပါ',
      };
      return text[language] || leg.instruction;
    } else {
      // transit leg
      if (route.transfers === 0) {
        const text: Record<LanguageCode, string> = {
          en: `Board MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — Direct train`,
          zh: `搭乘地铁 (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — 直达列车`,
          ms: `Naik MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — Kereta api terus`,
          ta: `MRT ரயிலில் ஏறவும் (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — நேரடி ரயில்`,
          my: `MRT ရထားစီးပါ (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — တိုက်ရိုက်ရထား`,
        };
        return text[language];
      } else {
        const transferNames = route.transferStations.map(stName => {
          const found = Object.values(ALL_STATIONS).find(s => s.name === stName);
          return found ? getStationDisplayName(found) : stName;
        }).join(', ');
        const text: Record<LanguageCode, string> = {
          en: `Board MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — ${route.transfers} transfer at ${transferNames}`,
          zh: `搭乘地铁 (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — 在 ${transferNames} 换乘 ${route.transfers} 次`,
          ms: `Naik MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) — ${route.transfers} pertukaran di ${transferNames}`,
          ta: `${transferNames} இல் ${route.transfers} முறை மாற்றத்துடன் MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) ரயிலில் ஏறவும்`,
          my: `${transferNames} တွင် ${route.transfers} ကြိမ်ပြောင်းစီးပြီး MRT (${route.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' / ')}) စီးပါ`,
        };
        return text[language];
      }
    }
  };

  const getLocalizedDoorNote = (doorNote: string) => {
    if (doorNote.includes('lift') || doorNote.includes('Lift') || doorNote.includes('Door 2/3')) {
      const text: Record<LanguageCode, string> = {
        en: 'Platform Door 2/3 direct to lift',
        zh: '站台门 2/3 直达无障碍升降机',
        ms: 'Pintu Platform 2/3 terus ke lif',
        ta: 'நடைமேடை கதவு 2/3 மின்தூக்கிக்கு நேராக உள்ளது',
        my: 'ပလက်ဖောင်းတံခါး ၂/၃ သည် ဓာတ်လှေကားနှင့် တည့်တည့်ဖြစ်သည်',
      };
      return text[language] || doorNote;
    }
    const text: Record<LanguageCode, string> = {
      en: 'Platform Door 1/6 for least crowds',
      zh: '站台门 1/6 人流最少',
      ms: 'Pintu Platform 1/6 untuk paling kurang sesak',
      ta: 'குறைந்த நெரிசலுக்கு நடைமேடை கதவு 1/6',
      my: 'လူအနည်းဆုံးဖြစ်ရန် ပလက်ဖောင်းတံခါး ၁/၆',
    };
    return text[language] || doorNote;
  };

  const getLocalizedDisruptionNote = (note?: string) => {
    if (!note) {
      const text: Record<LanguageCode, string> = {
        en: 'Track or signaling delays reported on this corridor.',
        zh: '此轨道区间报告信号或轨道轻微延误。',
        ms: 'Kelewatan landasan atau isyarat dilaporkan di koridor ini.',
        ta: 'இந்த வழித்தடத்தில் சிக்னல் அல்லது பாதை தாமதங்கள் பதிவாகியுள்ளன.',
        my: 'ဤလမ်းကြောင်းတွင် အချက်ပြစနစ် နှောင့်နှေးမှု သတင်းပို့ထားပါသည်။',
      };
      return text[language];
    }
    return note;
  };

  const getLocalizedAlternativeDesc = (alt: CalculatedRoute) => {
    const lineNames = alt.linesUsed.map((l) => getLocalizedLineName(l, language)).join(' + ');
    const text: Record<LanguageCode, string> = {
      en: `Take the ${lineNames} instead — ${alt.totalMinutes} ${t.minutes}, ${alt.transfers} ${t.transfers}, and completely avoids the crowded delay!`,
      zh: `建议改乘 ${lineNames} — 仅需 ${alt.totalMinutes} ${t.minutes}，换乘 ${alt.transfers} 次，完美避开延误拥挤！`,
      ms: `Gunakan ${lineNames} sebagai ganti — ${alt.totalMinutes} ${t.minutes}, ${alt.transfers} ${t.transfers}, dan elakkan kesesakan sama sekali!`,
      ta: `${lineNames} வழியைப் பயன்படுத்தவும் — ${alt.totalMinutes} ${t.minutes}, ${alt.transfers} ${t.transfers}, தாமதத்தை முற்றிலும் தவிர்க்கிறது!`,
      my: `${lineNames} ကို အစားထိုးစီးပါ — ${alt.totalMinutes} ${t.minutes}၊ ${alt.transfers} ကြိမ်ပြောင်းစီးရမည်ဖြစ်ပြီး ကြန့်ကြာမှုကို ရှောင်ရှားနိုင်သည်!`,
    };
    return text[language];
  };

  const localizedDecision = route.proactiveDecision
    ? getLocalizedProactiveDecision(route.proactiveDecision)
    : null;

  return (
    <div
      id="route-diagram-container"
      className={`rounded-2xl p-3.5 sm:p-4 border shadow-2xs transition-all ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Route Header Overview */}
      <div className="border-b pb-3 mb-3.5 flex items-start justify-between gap-2">
        <div>
          <div
            className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${
              isYellowBlack ? 'text-yellow-300' : 'text-slate-500'
            }`}
          >
            {getStationDisplayName(route.steps[0].fromStation)} &rarr;{' '}
            {getStationDisplayName(route.steps[route.steps.length - 1].toStation)}
          </div>
          <div className="text-lg sm:text-xl font-extrabold flex items-center gap-1.5 flex-wrap">
            <span>
              {route.totalMinutes} {t.minutes}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {route.transfers === 0
                ? t.noTransfers
                : `${route.transfers} ${
                    route.transfers === 1 ? t.transfer : t.transfers
                  }`}
            </span>
            {route.isStepFree && (
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Accessibility size={11} />
                <span>{t.stepFreeBadge}</span>
              </span>
            )}
            {route.shelteredPercentage && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ShieldCheck size={11} />
                <span>{route.shelteredPercentage}% {t.shelteredPercentage}</span>
              </span>
            )}
          </div>
        </div>

        {/* Lines Used Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {route.linesUsed.map((line) => {
            const meta = MRT_LINE_META[line];
            return (
              <span
                key={line}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                style={{ backgroundColor: meta?.color || '#009645' }}
              >
                {meta?.shortLabel || line}
              </span>
            );
          })}
        </div>
      </div>

      {/* Proactive Decision Support Alert Banner if present */}
      {route.proactiveDecision && localizedDecision && (
        <div className="mb-5 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 flex items-start gap-3">
          <Navigation size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <div className="flex items-center justify-between mb-1 gap-2">
              <strong className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                {localizedDecision.headline}
              </strong>
              {route.proactiveDecision.timeSavingsMins && (
                <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-md shrink-0">
                  {getLocalizedSavesText(route.proactiveDecision.timeSavingsMins)}
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-1.5">{localizedDecision.reason}</p>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 font-semibold">
              <span className="font-bold mr-1">{actionPrefix[language]}</span>
              <span>{localizedDecision.recommendedAction}</span>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal Door-to-Door First/Last Mile Summary */}
      {route.doorToDoorLegs && route.doorToDoorLegs.length > 0 && (
        <div className="mb-5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
            {doorToDoorHeader[language] || 'Door-to-Door Journey Breakdown'}
          </span>
          <div className="space-y-2 text-xs">
            {route.doorToDoorLegs.map((leg, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                  {leg.type === 'walk' ? <Footprints size={14} /> : leg.type === 'cycle' ? <Bike size={14} /> : <Train size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 break-words">
                      {getLocalizedLegInstruction(leg, i)}
                    </span>
                    <span className="font-mono text-xs text-slate-500 shrink-0">
                      {leg.durationMins}m &middot; {leg.distanceMeters}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disruption Alert Box if present */}
      {route.disruptionDelay > 0 && (
        <div
          className={`mb-5 p-3.5 rounded-xl border flex items-start gap-3 ${
            isYellowBlack
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed flex-1">
            <strong className="font-bold block text-sm mb-0.5">
              {t.disruptionAlert} (+{route.disruptionDelay} min delay)
            </strong>
            <span>
              {getLocalizedDisruptionNote(route.steps.find((s) => s.isDisrupted)?.disruptionNote)}
            </span>
          </div>
        </div>
      )}

      {/* Vertical Rail Diagram */}
      <div className="relative pl-3 pr-2 py-2">
        {route.steps.map((step, idx) => {
          const fromSt = step.fromStation;
          const toSt = step.toStation;
          const isLast = idx === route.steps.length - 1;
          const lineMeta = MRT_LINE_META[step.line] || { color: '#009645', name: step.line };
          const localizedLineName = getLocalizedLineName(step.line, language);
          const isInterchange = fromSt.codes.length > 1;

          return (
            <div key={`${fromSt.id}-${idx}`}>
              {/* Origin Station Node */}
              <div className="flex items-center gap-3.5 min-h-[44px]">
                {/* Node Ring */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                    isInterchange
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-black'
                        : 'border-slate-800 bg-white ring-2 ring-slate-300'
                      : isYellowBlack
                      ? 'border-yellow-400 bg-yellow-400'
                      : 'border-white bg-slate-900 shadow-xs'
                  }`}
                >
                  {isInterchange && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isYellowBlack ? 'bg-yellow-400' : 'bg-slate-900'
                      }`}
                    />
                  )}
                </div>

                {/* Station Info */}
                <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectStation && onSelectStation(fromSt.id)}
                      className="font-bold text-sm sm:text-base text-left hover:underline cursor-pointer"
                    >
                      {getStationDisplayName(fromSt)}
                    </button>
                    <span className="font-mono text-xs text-slate-400 font-semibold">
                      {fromSt.codes.join(' / ')}
                    </span>
                    {fromSt.accessibility.liftAccessible && (
                      <span title={t.liftReady} className="text-blue-600">
                        <Accessibility size={13} />
                      </span>
                    )}
                    {step.crowdLevel && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        step.crowdLevel === 'h' ? 'bg-rose-100 text-rose-700' : step.crowdLevel === 'l' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {step.crowdLevel === 'h' ? t.crowdHigh : step.crowdLevel === 'l' ? t.crowdLow : t.crowdModerate}
                      </span>
                    )}
                  </div>

                  {/* Audio Speak button */}
                  <button
                    type="button"
                    onClick={() => readStationAloud(fromSt, localizedLineName)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={`${t.readAloud || 'Read aloud'}: ${getStationDisplayName(fromSt)}`}
                    aria-label={`${t.readAloud || 'Read aloud'}: ${getStationDisplayName(fromSt)}`}
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              </div>

              {/* Segment Rail Bar */}
              <div className="flex items-stretch pl-2 py-0.5">
                {/* Colored Track Line */}
                <div className="w-1.5 mr-4 flex justify-center">
                  <div
                    className={`w-1.5 rounded-full transition-all ${
                      step.isDisrupted ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: step.isDisrupted ? '#F59E0B' : lineMeta.color,
                      minHeight: '44px',
                    }}
                  />
                </div>

                {/* Segment Details & Platform Door Guidance */}
                <div className="flex-1 py-1 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <span style={{ color: lineMeta.color }}>{localizedLineName}</span>
                    <span className="text-slate-400">&middot;</span>
                    <span className="text-slate-500">{step.time} {t.minutes}</span>
                    {step.isDisrupted && (
                      <span className="text-amber-600 font-bold">({t.disruptionAlert})</span>
                    )}
                  </div>

                  {/* Door & Carriage Advice for Commuters */}
                  <div className="mt-1 text-xs text-slate-500 flex items-start gap-1.5 leading-snug">
                    <CornerDownRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="break-words">
                      {t.boardCarriage} <strong>{step.recommendedCar || 1}</strong> &middot;{' '}
                      {getLocalizedDoorNote(step.doorNote)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Station on Last Step */}
              {isLast && (
                <div className="flex items-center gap-3.5 min-h-[44px] mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                      toSt.codes.length > 1
                        ? isYellowBlack
                          ? 'border-yellow-400 bg-black'
                          : 'border-slate-800 bg-white ring-2 ring-slate-300'
                        : isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400'
                        : 'border-white bg-slate-900 shadow-xs'
                    }`}
                  >
                    {toSt.codes.length > 1 && (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isYellowBlack ? 'bg-yellow-400' : 'bg-slate-900'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectStation && onSelectStation(toSt.id)}
                        className="font-bold text-sm sm:text-base text-left hover:underline cursor-pointer"
                      >
                        {getStationDisplayName(toSt)}
                      </button>
                      <span className="font-mono text-xs text-slate-400 font-semibold">
                        {toSt.codes.join(' / ')}
                      </span>
                      {toSt.accessibility.liftAccessible && (
                        <span title={t.liftReady} className="text-blue-600">
                          <Accessibility size={13} />
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => readStationAloud(toSt, localizedLineName)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`${t.readAloud || 'Read aloud'}: ${getStationDisplayName(toSt)}`}
                      aria-label={`${t.readAloud || 'Read aloud'}: ${getStationDisplayName(toSt)}`}
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Suggested Low-Sensory / Faster Alternative Banner */}
      {route.alternativeRoute && (
        <div
          className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
                isYellowBlack ? 'text-yellow-400' : 'text-purple-700'
              }`}
            >
              {t.bypassSuggestion}
            </span>
            <p className="text-xs sm:text-sm leading-relaxed">
              {getLocalizedAlternativeDesc(route.alternativeRoute)}
            </p>
          </div>

          {onApplyAlternative && (
            <button
              type="button"
              onClick={onApplyAlternative}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
              }`}
            >
              {t.switchRouteBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

