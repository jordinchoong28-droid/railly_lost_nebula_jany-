import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, ArrowUpDown, Check, ChevronRight, Navigation, Heart, ShieldCheck, Footprints, AlertCircle, Compass } from 'lucide-react';
import { ALL_STATIONS } from '../data/mrtData';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { AppTheme, CalculatedRoute, ContrastMode, FontSizeScale, LanguageCode, StationData, TelegramMrtPost } from '../types';
import { VoiceService } from '../utils/speech';
import { getStationDisplayName } from '../utils/stationName';
import { THEME_CONFIG } from '../utils/theme';

interface SimpleSeniorViewProps {
  fromStationId: string;
  toStationId: string;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  onSwap: () => void;
  calculatedRoute: CalculatedRoute | null;
  language: LanguageCode;
  contrastMode: ContrastMode;
  fontSize: FontSizeScale;
  onFontSizeChange: (size: FontSizeScale) => void;
  theme: AppTheme;
  onSwitchToDetailed: () => void;
  activeTelegramAlert?: TelegramMrtPost | null;
}

export const SimpleSeniorView: React.FC<SimpleSeniorViewProps> = ({
  fromStationId,
  toStationId,
  onFromChange,
  onToChange,
  onSwap,
  calculatedRoute,
  language,
  contrastMode,
  fontSize,
  onFontSizeChange,
  theme,
  onSwitchToDetailed,
  activeTelegramAlert,
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;

  const [isSpeaking, setIsSpeaking] = useState(VoiceService.isSpeakingState());
  const [isPaused, setIsPaused] = useState(VoiceService.isPausedState());
  const [selectingTarget, setSelectingTarget] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to voice status
  useEffect(() => {
    const unsub = VoiceService.subscribe(() => {
      setIsSpeaking(VoiceService.isSpeakingState());
      setIsPaused(VoiceService.isPausedState());
    });
    return unsub;
  }, []);

  const fromStation = ALL_STATIONS[fromStationId] || ALL_STATIONS['clementi'];
  const toStation = ALL_STATIONS[toStationId] || ALL_STATIONS['outram-park'];

  // Quick popular destinations for seniors and families
  const POPULAR_DESTINATIONS = [
    { id: 'outram-park', icon: '🏥', label: language === 'zh' ? '中央医院 (SGH)' : language === 'ms' ? 'Hospital SGH' : language === 'ta' ? 'பொது மருத்துவமனை' : language === 'my' ? 'SGH ဆေးရုံကြီး' : 'SGH Hospital' },
    { id: 'novena', icon: '🏥', label: language === 'zh' ? '陈笃生医院 (TTSH)' : language === 'ms' ? 'Hospital TTSH' : language === 'ta' ? 'TTSH மருத்துவமனை' : language === 'my' ? 'TTSH ဆေးရုံ' : 'TTSH Hospital' },
    { id: 'orchard', icon: '🛍️', label: language === 'zh' ? '乌节路 (Orchard)' : language === 'ms' ? 'Pusat Membeli-belah' : language === 'ta' ? 'ஆர்ச்சர்ட்' : language === 'my' ? 'Orchard ဈေးဝယ်စင်တာ' : 'Orchard Road' },
    { id: 'changi-airport', icon: '✈️', label: language === 'zh' ? '樟宜机场' : language === 'ms' ? 'Lapangan Terbang Changi' : language === 'ta' ? 'சாங்கி விமானநிலையம்' : language === 'my' ? 'ချန်ဂီလေဆိပ်' : 'Changi Airport' },
    { id: 'marina-bay', icon: '🌊', label: language === 'zh' ? '滨海湾 (Marina Bay)' : language === 'ms' ? 'Marina Bay' : language === 'ta' ? 'மெரினா பே' : language === 'my' ? 'Marina Bay' : 'Marina Bay' },
    { id: 'jurong-east', icon: '🏢', label: language === 'zh' ? '裕廊东 (Jurong East)' : language === 'ms' ? 'Jurong East' : language === 'ta' ? 'ஜூரோங் ஈஸ்ட்' : language === 'my' ? 'Jurong East' : 'Jurong East' }
  ];

  // Voice handler with speech synthesis
  const handlePlayVoice = () => {
    if (isPaused) {
      VoiceService.resume();
      return;
    }
    if (isSpeaking) {
      VoiceService.stop();
      return;
    }

    if (!calculatedRoute) return;

    let announcement = '';
    if (language === 'zh') {
      announcement = `为您播报路线。从${getStationDisplayName(fromStation, 'zh')}出发，前往${getStationDisplayName(toStation, 'zh')}。预计需要${calculatedRoute.totalMinutes}分钟。全程保障无障碍升降梯。第一步，在${fromStation.name}乘车。请注意安全，抓紧扶手。`;
    } else if (language === 'ms') {
      announcement = `Panduan suara laluan anda. Dari stesen ${fromStation.name} ke ${toStation.name}. Anggaran masa perjalanan ialah ${calculatedRoute.totalMinutes} minit. Dilengkapi dengan akses lif tanpa tangga. Langkah pertama, naik kereta api di stesen ${fromStation.name}.`;
    } else if (language === 'ta') {
      announcement = `உங்கள் பயண வழிகாட்டல். ${fromStation.name} நிலையத்திலிருந்து ${toStation.name} வரை. பயண நேரம் சுமார் ${calculatedRoute.totalMinutes} நிமிடங்கள். படிக்கட்டுகள் அற்ற மின்தூக்கி வசதி உள்ளது. முதலில் ${fromStation.name} நிலையத்தில் ரயிலில் ஏறுங்கள்.`;
    } else if (language === 'my') {
      announcement = `သင်၏ ခရီးစဉ်လမ်းညွှန်ဖြစ်ပါသည်။ ${fromStation.name} ဘူတာမှ ${toStation.name} ဘူတာသို့ သွားပါမည်။ ခရီးစဉ်ကြာချိန် မိနစ် ${calculatedRoute.totalMinutes} ဖြစ်ပါသည်။ ဓာတ်လှေကားအပြည့်အစုံပါရှိပါသည်။ စတင်စီးနင်းရန် ${fromStation.name} ဘူတာတွင် ရထားစီးပါ။`;
    } else {
      announcement = `Your accessible route from ${fromStation.name} to ${toStation.name}. Estimated travel time is ${calculatedRoute.totalMinutes} minutes with step-free lift access. Step 1: Board train at ${fromStation.name}. Please hold the handrails for safety.`;
    }

    VoiceService.speak(announcement, language);
  };

  const handlePauseVoice = () => {
    VoiceService.pause();
  };

  const handleResumeVoice = () => {
    VoiceService.resume();
  };

  const handleStopVoice = () => {
    VoiceService.stop();
  };

  const allStationList = Object.values(ALL_STATIONS);
  const filteredStations = allStationList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameZh?.includes(q) ||
      s.nameTa?.includes(q) ||
      s.nameMs?.toLowerCase().includes(q) ||
      s.nameMy?.includes(q) ||
      s.codes.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div id="simple-senior-screen" className="space-y-4 animate-in fade-in duration-200">
      {/* Top Friendly Accessibility Banner */}
      <div
        className={`p-4 rounded-3xl border-2 transition-all shadow-sm ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-300'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👵👴</span>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {t.simpleMode || 'Easy Senior Mode'}
              </h2>
              <p className="text-xs opacity-80 mt-0.5">
                {t.simpleModeDesc || 'Large text, big buttons, and simple 3-step directions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToDetailed}
            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold shrink-0 shadow-2xs transition-all ${
              isYellowBlack
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {t.detailedMode || 'Full Details'} &rarr;
          </button>
        </div>

        {/* Quick 1-Tap Font Size Buttons */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <span>🔤</span>
            <span>{t.fontSize || 'Text Size'}:</span>
          </span>
          <div className="flex items-center gap-1.5">
            {(['a', 'a+', 'a++', 'a+++'] as FontSizeScale[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onFontSizeChange(size)}
                className={`min-w-[42px] h-9 px-2 rounded-xl font-black text-sm border-2 transition-all flex items-center justify-center ${
                  fontSize === size
                    ? isYellowBlack
                      ? 'bg-yellow-400 text-black border-yellow-400 ring-2 ring-yellow-400'
                      : 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                    : isYellowBlack
                    ? 'bg-black text-yellow-300 border-yellow-400/50'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                aria-label={`Set font size to ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Journey Selection Card with Extra Large Inputs */}
      <div
        className={`p-4 rounded-3xl border-2 transition-all shadow-md ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-300'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}
      >
        <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>{t.simpleWhereTo || 'Where would you like to go?'}</span>
        </h3>

        {/* Origin & Destination Large Pickers */}
        <div className="space-y-3">
          {/* Origin Picker */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              A
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectingTarget('from');
                setSearchQuery('');
              }}
              className={`flex-1 min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                  : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {t.simpleFrom || 'Starting Station'}
                </div>
                <div className="text-base font-black tracking-tight">
                  {getStationDisplayName(fromStation, language)}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-mono font-bold shrink-0">
                {fromStation.codes.join('/')}
              </span>
            </button>
          </div>

          {/* Swap Stations Center Button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={onSwap}
              className={`min-h-[44px] px-4 py-1.5 rounded-full border-2 flex items-center gap-2 text-xs font-black transition-transform active:scale-95 shadow-xs ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <ArrowUpDown size={15} />
              <span>{t.swap}</span>
            </button>
          </div>

          {/* Destination Picker */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              B
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectingTarget('to');
                setSearchQuery('');
              }}
              className={`flex-1 min-h-[54px] px-4 py-2.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                  : 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  {t.simpleTo || 'Destination Station'}
                </div>
                <div className="text-base font-black tracking-tight">
                  {getStationDisplayName(toStation, language)}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-bold shrink-0">
                {toStation.codes.join('/')}
              </span>
            </button>
          </div>
        </div>

        {/* 1-Tap Popular Destination Shortcuts */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Heart size={13} className="text-rose-500" />
            <span>{t.simpleQuickDestinations || 'Popular Places'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => onToChange(dest.id)}
                className={`min-h-[48px] p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  toStationId === dest.id
                    ? isYellowBlack
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                      : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-black ring-2 ring-offset-1 ring-slate-300`
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60'
                }`}
              >
                <span className="text-xl shrink-0">{dest.icon}</span>
                <span className="text-xs font-extrabold truncate">{dest.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Voice Guidance Controls with Pause / Resume / Stop at Any Time */}
      <div
        className={`p-4 rounded-3xl border-2 transition-all shadow-md ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-300'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <div>
              <div className="font-extrabold text-sm">{t.voiceGuidance}</div>
              <div className="text-[11px] opacity-75">
                {isSpeaking
                  ? isPaused
                    ? (t.voicePausedStatus || 'Paused — tap resume to continue')
                    : 'Speaking live directions...'
                  : 'Hands-free spoken directions for seniors'}
              </div>
            </div>
          </div>
          {isSpeaking && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-black animate-pulse ${
              isPaused ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {isPaused ? 'PAUSED' : 'SPEAKING'}
            </span>
          )}
        </div>

        {/* Big Touch-Friendly Voice Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {!isSpeaking ? (
            <button
              type="button"
              onClick={handlePlayVoice}
              className={`col-span-3 min-h-[52px] rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Volume2 size={22} />
              <span>{t.simplePlayVoice || 'Listen to Route'}</span>
            </button>
          ) : (
            <>
              {/* Pause or Resume */}
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResumeVoice}
                  className="min-h-[50px] rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Play size={18} />
                  <span>{t.voiceResume || 'Resume'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseVoice}
                  className="min-h-[50px] rounded-2xl bg-amber-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Pause size={18} />
                  <span>{t.voicePause || 'Pause'}</span>
                </button>
              )}

              {/* Stop Voice */}
              <button
                type="button"
                onClick={handleStopVoice}
                className="min-h-[50px] rounded-2xl bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <VolumeX size={18} />
                <span>{t.voiceStop || 'Stop'}</span>
              </button>

              {/* Repeat / Replay */}
              <button
                type="button"
                onClick={() => {
                  VoiceService.stop();
                  setTimeout(() => handlePlayVoice(), 200);
                }}
                className="min-h-[50px] rounded-2xl bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Volume2 size={18} />
                <span>Replay</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Disruption Alert for Seniors */}
      {activeTelegramAlert && (
        <div
          role="alert"
          className={`p-4 rounded-3xl border-2 shadow-lg animate-pulse transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-red-50 border-red-400 text-red-950 dark:bg-red-950/80 dark:text-red-100 dark:border-red-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <div className="font-black text-sm uppercase tracking-wide text-red-600 dark:text-red-400">
                Train Delay Notice (Telegram @sgmrt)
              </div>
              <div className="font-extrabold text-sm mt-0.5">
                {activeTelegramAlert.routeImpactReason || 'A delay affects this train line.'}
              </div>
              <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium">
                "{activeTelegramAlert.text}"
              </p>
              {activeTelegramAlert.delayMinutes > 0 && (
                <div className="mt-2 inline-block px-2.5 py-1 rounded-xl font-black text-xs bg-red-600 text-white">
                  Expected extra time: +{activeTelegramAlert.delayMinutes} minutes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple 3-Step Clear Route Cards */}
      {calculatedRoute ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>🗺️</span>
              <span>{t.routeSummary || 'Route Overview'}</span>
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-full font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>{calculatedRoute.totalMinutes} {t.minutes}</span>
            </span>
          </div>

          {/* STEP 1: Board train at Start */}
          <div
            className={`p-4 rounded-3xl border-2 shadow-xs transition-all ${
              isYellowBlack
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {t.simpleBoard || 'Board train'}
                </div>
                <div className="text-base font-black mt-0.5">
                  {getStationDisplayName(fromStation, language)}
                </div>
                <div className="text-xs font-medium opacity-80 mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold">
                    {fromStation.lines[0] || 'MRT'}
                  </span>
                  <span>{t.stepFreeVerified || '100% Step-Free Verified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Ride or Transfer */}
          {calculatedRoute.steps.length > 1 ? (
            calculatedRoute.steps.slice(0, -1).map((step, idx) => {
              const lineMeta = MRT_LINE_META[step.line] || { color: '#009645', name: step.line };
              return (
                <div
                  key={`step-${idx}`}
                  className={`p-4 rounded-3xl border-2 shadow-xs transition-all ${
                    isYellowBlack
                      ? 'bg-black border-yellow-400 text-yellow-300'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {idx + 2}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {t.simpleTransfer || 'Change train at'}
                      </div>
                      <div className="text-base font-black mt-0.5">
                        {getStationDisplayName(step.toStation, language)}
                      </div>
                      <div className="text-xs opacity-80 mt-1 flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-white font-bold"
                          style={{ backgroundColor: lineMeta.color }}
                        >
                          {lineMeta.name}
                        </span>
                        <span>{step.time} {t.minutes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`p-4 rounded-3xl border-2 shadow-xs transition-all ${
                isYellowBlack
                  ? 'bg-black border-yellow-400 text-yellow-300'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {t.directTrain || 'Direct Train • No transfers'}
                  </div>
                  <div className="text-base font-black mt-0.5">
                    {calculatedRoute.steps[0]?.time || 15} {t.minutes}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {t.elderlyQuickSummary || 'Stay on train until destination'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINAL STEP: Alight at Destination */}
          <div
            className={`p-4 rounded-3xl border-2 shadow-xs transition-all ${
              isYellowBlack
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                {calculatedRoute.steps.length > 1 ? calculatedRoute.steps.length + 1 : 3}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  {t.simpleAlight || 'Alight at'}
                </div>
                <div className="text-base font-black mt-0.5">
                  {getStationDisplayName(toStation, language)}
                </div>
                <div className="text-xs opacity-80 mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 font-bold">
                    {toStation.codes.join('/')}
                  </span>
                  <span>{toStation.accessibility?.liftAccessible ? '🛗 Lift to street level' : 'Exit to street'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border-2 text-center text-xs opacity-70">
          {t.planJourneyTitle}
        </div>
      )}

      {/* Station Picker Modal for Easy Senior Selection */}
      {selectingTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in"
          onClick={() => setSelectingTarget(null)}
        >
          <div
            className={`w-full max-w-md max-h-[85vh] rounded-3xl border-2 shadow-2xl p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 ${
              isYellowBlack
                ? 'bg-black border-yellow-400 text-yellow-300'
                : isHighContrastDark
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black">
                  {selectingTarget === 'from' ? t.simpleFrom : t.simpleTo}
                </h3>
                <p className="text-xs opacity-70 mt-0.5">
                  Tap any station or search below
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectingTarget(null)}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold"
              >
                {t.close}
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '输入站名或编码 (例如 Orchard, NS22)...' : 'Search station or code...'}
              className={`w-full min-h-[46px] px-3.5 rounded-xl border text-sm font-semibold outline-none ${
                isYellowBlack
                  ? 'bg-black border-yellow-400 text-yellow-300'
                  : 'bg-slate-100 border-slate-200 text-slate-900 focus:bg-white'
              }`}
              autoFocus
            />

            {/* Station List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[50vh] pr-1">
              {filteredStations.map((st) => {
                const isSelected = selectingTarget === 'from' ? fromStationId === st.id : toStationId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (selectingTarget === 'from') onFromChange(st.id);
                      if (selectingTarget === 'to') onToChange(st.id);
                      setSelectingTarget(null);
                    }}
                    className={`w-full min-h-[50px] px-3 py-2 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? isYellowBlack
                          ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 font-black'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm">{getStationDisplayName(st, language)}</div>
                      <div className="text-[11px] opacity-70 font-mono">{st.codes.join(' / ')}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
