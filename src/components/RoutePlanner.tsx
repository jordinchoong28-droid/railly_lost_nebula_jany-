import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Search, Mic, MicOff, Compass, MapPin, Circle } from 'lucide-react';
import { ALL_STATIONS } from '../data/mrtData';
import { AppTheme, ContrastMode, LanguageCode, RoutingPreference, StationData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceService } from '../utils/speech';
import { THEME_CONFIG } from '../utils/theme';

import { getStationDisplayName } from '../utils/stationName';

interface RoutePlannerProps {
  fromStationId: string;
  toStationId: string;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
  onSwap: () => void;
  preference: RoutingPreference;
  onPreferenceChange: (pref: RoutingPreference) => void;
  onFindRoute: () => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  onVoiceCommandResult?: (text: string) => void;
  theme?: AppTheme;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  fromStationId,
  toStationId,
  onFromChange,
  onToChange,
  onSwap,
  preference,
  onPreferenceChange,
  onFindRoute,
  language,
  contrastMode,
  onVoiceCommandResult,
  theme = 'pink',
}) => {
  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const [fromQuery, setFromQuery] = useState(ALL_STATIONS[fromStationId]?.name || '');
  const [toQuery, setToQuery] = useState(ALL_STATIONS[toStationId]?.name || '');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (ALL_STATIONS[fromStationId]) {
      setFromQuery(getStationDisplayName(ALL_STATIONS[fromStationId], language));
    }
  }, [fromStationId, language]);

  useEffect(() => {
    if (ALL_STATIONS[toStationId]) {
      setToQuery(getStationDisplayName(ALL_STATIONS[toStationId], language));
    }
  }, [toStationId, language]);

  const stationList = Object.values(ALL_STATIONS);

  function filterStations(q: string) {
    const query = q.trim().toLowerCase();
    if (!query) return stationList.slice(0, 15);
    return stationList
      .filter((s) => {
        return (
          s.name.toLowerCase().includes(query) ||
          s.codes.some((c) => c.toLowerCase().includes(query)) ||
          s.nameZh?.includes(query) ||
          s.nameTa?.includes(query) ||
          s.nameMs?.toLowerCase().includes(query) ||
          s.nameMy?.includes(query)
        );
      })
      .slice(0, 40);
  }

  const handleVoiceListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setVoiceFeedback(t.voiceListening);
    setIsListening(true);

    const rec = VoiceService.createSpeechRecognizer(
      language,
      (transcript) => {
        setVoiceFeedback(`Heard: "${transcript}"`);
        setIsListening(false);

        const parsed = VoiceService.parseVoiceCommand(transcript);
        if (parsed.action === 'set_destination' && parsed.stationName) {
          const query = parsed.stationName.toLowerCase().trim();
          const match = stationList.find(
            (s) =>
              s.name.toLowerCase().includes(query) ||
              s.nameZh.includes(parsed.stationName!) ||
              s.nameMs.toLowerCase().includes(query) ||
              s.nameTa.includes(parsed.stationName!) ||
              s.nameMy.includes(parsed.stationName!)
          );
          if (match) {
            onToChange(match.id);
            const locName = VoiceService.getLocalizedStationName(match, language);
            const feedbackSpeech = VoiceService.formatDestinationSpeech(locName, language);
            const phonetic = VoiceService.formatPhoneticDestinationSpeech(match.name, language);
            VoiceService.speak(feedbackSpeech, language, undefined, phonetic);
          }
        }

        if (onVoiceCommandResult) {
          onVoiceCommandResult(transcript);
        }
      },
      () => {
        setVoiceFeedback('Voice recognition unavailable or mic blocked.');
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      recognitionRef.current = rec;
      rec.start();
    } else {
      setVoiceFeedback('Web Speech API is not supported in this browser.');
      setIsListening(false);
    }
  };

  const quickStationIds = ['city-hall', 'jurong-east', 'dhoby-ghaut', 'marina-bay', 'changi-airport'];

  return (
    <section
      id="route-planner-card"
      aria-label="MRT Route Planner"
      className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/90 shadow-2xs text-slate-900'
      }`}
    >
      {/* Top Planner Bar: Title + Mic */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Compass size={16} className={isYellowBlack ? 'text-yellow-400' : themeStyle.primaryText} />
          <h2 className="text-xs font-bold uppercase tracking-wider">{t.planJourneyTitle}</h2>
        </div>

        {/* Voice Command Mic Button */}
        <button
          id="mic-command-btn"
          type="button"
          onClick={handleVoiceListen}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all tap-bounce ${
            isListening
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : isYellowBlack
              ? 'bg-black text-yellow-400 border-yellow-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
          }`}
          title="Voice command (Hands-free station navigation)"
          aria-label="Voice input command"
        >
          {isListening ? <MicOff size={13} /> : <Mic size={13} />}
          <span>{isListening ? t.voiceListening : t.tapToSpeak}</span>
        </button>
      </div>

      {voiceFeedback && (
        <div
          className={`mb-2.5 p-2 rounded-xl text-xs font-medium flex items-center justify-between ${
            isYellowBlack
              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span className="line-clamp-1">{voiceFeedback}</span>
          <button
            type="button"
            onClick={() => setVoiceFeedback(null)}
            className="text-[11px] underline shrink-0 ml-2"
          >
            {t.clearText || 'Clear'}
          </button>
        </div>
      )}

      {/* Transit Card Style Connected Inputs */}
      <div className="relative flex items-center gap-2 mb-3">
        {/* Left Vertical Line Connector */}
        <div className="flex flex-col items-center self-stretch py-3.5 px-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
          <div className="w-0.5 flex-1 bg-slate-300 dark:bg-slate-700 my-1 border-dashed" />
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0" />
        </div>

        {/* Input Fields Stack */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Origin */}
          <div className="relative">
            <input
              id="from-station-input"
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromDropdown(true);
              }}
              onFocus={() => setShowFromDropdown(true)}
              placeholder={t.originPlaceholder}
              className={`w-full min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                isYellowBlack
                  ? 'bg-black border-yellow-400 text-yellow-300'
                  : isHighContrastDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400'
              }`}
            />
            {showFromDropdown && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-lg ${
                  isYellowBlack
                    ? 'bg-black border-yellow-400 text-yellow-300'
                    : isHighContrastDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {filterStations(fromQuery).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onFromChange(st.id);
                      setFromQuery(getStationDisplayName(st, language));
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-bold">{getStationDisplayName(st, language)}</span>
                    <span className="text-[10px] font-mono text-slate-400">{st.codes.join('/')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="relative">
            <input
              id="to-station-input"
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToDropdown(true);
              }}
              onFocus={() => setShowToDropdown(true)}
              placeholder={t.destPlaceholder}
              className={`w-full min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                isYellowBlack
                  ? 'bg-black border-yellow-400 text-yellow-300'
                  : isHighContrastDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400'
              }`}
            />
            {showToDropdown && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-lg ${
                  isYellowBlack
                    ? 'bg-black border-yellow-400 text-yellow-300'
                    : isHighContrastDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {filterStations(toQuery).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onToChange(st.id);
                      setToQuery(getStationDisplayName(st, language));
                      setShowToDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-bold">{getStationDisplayName(st, language)}</span>
                    <span className="text-[10px] font-mono text-slate-400">{st.codes.join('/')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button on Right */}
        <button
          id="swap-stations-btn"
          type="button"
          onClick={onSwap}
          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 tap-bounce ${
            isYellowBlack
              ? 'bg-black text-yellow-400 border-yellow-400'
              : isHighContrastDark
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Swap origin and destination"
          aria-label="Swap origin and destination"
        >
          <ArrowUpDown size={14} />
        </button>
      </div>

      {/* Quick Select Station Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-2.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">{t.quickStationsLabel}</span>
        {quickStationIds.map((id) => {
          const st = ALL_STATIONS[id];
          if (!st) return null;
          const label = getStationDisplayName(st, language);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onToChange(id);
                setToQuery(label);
              }}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-600 whitespace-nowrap shrink-0 transition-colors"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Preferences Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-3">
        {[
          { id: 'fastest' as RoutingPreference, label: t.prefFastest || 'Fastest' },
          { id: 'sheltered-multimodal' as RoutingPreference, label: t.prefSheltered || '☔ Rain-Sheltered' },
          { id: 'step-free' as RoutingPreference, label: t.prefStepFree || 'Step-Free' },
          { id: 'low-sensory' as RoutingPreference, label: t.prefSensory || 'Quiet & Calm' },
          { id: 'least-crowded' as RoutingPreference, label: t.prefCrowd || 'Least Crowded' },
        ].map((pref) => {
          const isSelected = preference === pref.id;
          return (
            <button
              key={pref.id}
              type="button"
              id={`btn-route-pref-${pref.id}`}
              onClick={() => onPreferenceChange(pref.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? isYellowBlack
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : `${themeStyle.primaryBg} text-white border-transparent shadow-2xs`
                  : 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'
              }`}
            >
              {pref.label}
            </button>
          );
        })}
      </div>

      {/* Submit / Find Route Button */}
      <button
        id="find-route-btn"
        type="button"
        onClick={() => {
          setShowFromDropdown(false);
          setShowToDropdown(false);
          onFindRoute();
        }}
        className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all tap-bounce ${
          isYellowBlack
            ? 'bg-yellow-400 text-black font-extrabold'
            : `${themeStyle.primaryBg} text-white ${themeStyle.primaryBgHover}`
        }`}
      >
        <Compass size={15} />
        <span>{t.calculateJourney}</span>
      </button>
    </section>
  );
};
