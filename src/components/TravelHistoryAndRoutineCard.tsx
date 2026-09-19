import React, { useState } from 'react';
import {
  History,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Trash2,
} from 'lucide-react';
import { AppTheme, CommuterTripRecord, ContrastMode, LanguageCode, LearnedRoutine, StructuredDisruptionFeedItem } from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { ALL_STATIONS } from '../data/mrtData';
import { TRANSLATIONS } from '../data/translations';

interface TravelHistoryAndRoutineCardProps {
  travelHistory: CommuterTripRecord[];
  onSelectRoutineRoute: (originId: string, destId: string) => void;
  onClearHistory?: () => void;
  activeDisruptions: StructuredDisruptionFeedItem[];
  contrastMode: ContrastMode;
  theme: AppTheme;
  language?: LanguageCode;
}

export const TravelHistoryAndRoutineCard: React.FC<TravelHistoryAndRoutineCardProps> = ({
  travelHistory,
  onSelectRoutineRoute,
  onClearHistory,
  activeDisruptions,
  contrastMode,
  theme,
  language = 'en',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const getStationName = (id: string) => {
    const st = ALL_STATIONS[id];
    if (!st) return id;
    if (language === 'zh' && st.nameZh) return `${st.name} (${st.nameZh})`;
    if (language === 'ms' && st.nameMs) return st.nameMs;
    if (language === 'ta' && st.nameTa) return `${st.name} (${st.nameTa})`;
    if (language === 'my' && st.nameMy) return `${st.name} (${st.nameMy})`;
    return st.name;
  };
  const safeHistory = Array.isArray(travelHistory) ? travelHistory : [];
  const safeDisruptions = Array.isArray(activeDisruptions) ? activeDisruptions : [];

  // Infer user routine from history
  const inferLearnedRoutine = (): LearnedRoutine => {
    if (safeHistory.length === 0) {
      return {
        usualOriginId: 'tampines',
        usualDestinationId: 'raffles-place',
        frequentLines: ['EWL'],
        peakTravelHours: ['08:00 - 09:15', '18:00 - 19:15'],
        summary: 'Daily weekday commute between Tampines and Raffles Place (EWL).',
        relevantDisruptionCount: safeDisruptions.filter((d) => d.line === 'EWL').length,
      };
    }

    const routeCounts = new Map<string, number>();
    safeHistory.forEach((trip) => {
      const key = `${trip.fromStationId}|${trip.toStationId}`;
      routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
    });

    let topRoute = `${safeHistory[0].fromStationId}|${safeHistory[0].toStationId}`;
    let maxCount = 0;
    routeCounts.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        topRoute = key;
      }
    });

    const [originId, destId] = topRoute.split('|');
    const originStation = ALL_STATIONS[originId];
    const frequentLines = (originStation ? originStation.lines : ['EWL']) as unknown as import('../types').MRTLineCode[];

    const relevantDisruptions = activeDisruptions.filter((d) => frequentLines.includes(d.line));

    return {
      usualOriginId: originId,
      usualDestinationId: destId,
      frequentLines,
      peakTravelHours: ['08:00 - 09:00', '18:00 - 19:00'],
      summary: `Learned routine based on ${safeHistory.length} recorded journeys: ${getStationName(originId)} ↔ ${getStationName(destId)}.`,
      relevantDisruptionCount: relevantDisruptions.length,
    };
  };

  const routine = inferLearnedRoutine();

  return (
    <div
      id="travel-history-routine-card"
      className={`rounded-2xl border p-3.5 transition-all shadow-xs ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-800'
      }`}
    >
      {/* 1. Header with AI Routine Summary */}
      <div className="flex items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isYellowBlack ? 'bg-yellow-400 text-black' : `${themeStyle.softBg} ${themeStyle.primaryText}`
            }`}
          >
            <History size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>{t.routineTitle || 'Learned Routine & Travel History'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-400/30">
                {t.routineAIEngine || 'AI Routine'}
              </span>
            </h3>
            <p className="text-[10px] opacity-75 font-medium">
              {t.routineSubtitle || 'Filters disruptions to only what affects your daily commute'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold ${
            isYellowBlack
              ? 'border-yellow-400 text-yellow-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {isExpanded ? (t.moreFacilitiesHide || 'Hide') : `${t.pastTrips || 'Trips'} (${safeHistory.length})`}
        </button>
      </div>

      {/* 2. Inferred Routine & Disruption Filter Badge */}
      <div className="mt-2.5 space-y-2">
        <div
          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
            isYellowBlack
              ? 'border-yellow-400/60 bg-yellow-400/10'
              : 'border-purple-200/80 bg-purple-50/60 dark:border-purple-900/40 dark:bg-purple-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 text-purple-800 dark:text-purple-300">
              <Sparkles size={13} />
              <span>{t.inferredDailyRoutine || 'Inferred Daily Routine'}</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
              {routine.frequentLines.join(', ')} {t.corridorLabel || 'Corridor'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-black">
            <span className="flex items-center gap-1.5">
              <span>{getStationName(routine.usualOriginId)}</span>
              <ArrowRight size={13} />
              <span>{getStationName(routine.usualDestinationId)}</span>
            </span>
            <button
              type="button"
              id="btn-plan-routine-trip"
              onClick={() => onSelectRoutineRoute(routine.usualOriginId, routine.usualDestinationId)}
              className={`text-[10px] font-black underline ${
                isYellowBlack ? 'text-yellow-400' : themeStyle.primaryText
              }`}
            >
              {t.planJourneyNow || 'Plan Journey Now'}
            </button>
          </div>

          {/* AI Disruption Filtering Status */}
          <div className="mt-1 pt-1.5 border-t border-purple-200/50 dark:border-purple-800/40 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 font-bold">
              {routine.relevantDisruptionCount > 0 ? (
                <>
                  <AlertCircle size={13} className="text-amber-500" />
                  <span className="text-amber-700 dark:text-amber-400">
                    {routine.relevantDisruptionCount} {t.disruptionsAffectRoutine || 'disruption impacts your daily routine!'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {t.routineCorridorSmooth || 'Your daily corridor is operating smoothly'} ({routine.frequentLines.join('/')})
                  </span>
                </>
              )}
            </div>

            <span className="text-[9px] opacity-70">
              ({t.otherLineDelaysFiltered || 'Other line delays filtered'})
            </span>
          </div>
        </div>

        {/* 3. Expanded Past Trips List */}
        {isExpanded && (
          <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span>{t.recentJourneys || 'Recent Journeys'}:</span>
              {onClearHistory && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>{t.clearHistory || 'Clear'}</span>
                </button>
              )}
            </div>

            {safeHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 text-center">
                {t.noPastTrips || 'No past trips yet. Search for any route to add it to your travel history.'}
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {safeHistory.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => onSelectRoutineRoute(trip.fromStationId, trip.toStationId)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                      isYellowBlack
                        ? 'border-yellow-400/40 bg-black'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{getStationName(trip.fromStationId)}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span>{getStationName(trip.toStationId)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <Clock size={11} />
                      <span>{trip.timeOfDay || 'Earlier'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
