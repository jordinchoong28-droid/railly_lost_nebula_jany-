import React, { useState, useMemo } from 'react';
import {
  Accessibility,
  Volume2,
  VolumeX,
  Phone,
  Check,
  Search,
  X,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ContrastMode,
  FontSizeScale,
  LanguageCode,
  StationData,
  LiftMaintenanceItem,
  AppTheme,
} from '../types';
import { TRANSLATIONS, MRT_LINE_META } from '../data/translations';
import { ALL_STATIONS } from '../data/mrtData';
import { VoiceService } from '../utils/speech';

interface SensoryAndAccessibilityPanelProps {
  station: StationData;
  isLowSensoryActive: boolean;
  onToggleLowSensory: () => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  fontSize?: FontSizeScale;
  onFontSizeChange?: (size: FontSizeScale) => void;
  onSelectStation?: (stationId: string) => void;
  liftMaintenance?: LiftMaintenanceItem[];
  theme?: AppTheme;
  onContrastModeChange?: (mode: ContrastMode) => void;
}

export const SensoryAndAccessibilityPanel: React.FC<SensoryAndAccessibilityPanelProps> = ({
  station,
  isLowSensoryActive,
  onToggleLowSensory,
  language,
  contrastMode,
  onSelectStation,
  liftMaintenance = [],
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const [stationSearch, setStationSearch] = useState('');
  const [showMoreFacilities, setShowMoreFacilities] = useState(false);
  const [rampRequested, setRampRequested] = useState(false);

  const stations = useMemo(() => Object.values(ALL_STATIONS), []);

  // Filtered station search for quick inspection
  const searchResults = useMemo(() => {
    if (!stationSearch.trim()) return [];
    const q = stationSearch.toLowerCase().trim();
    return stations
      .filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.codes.some((c) => c.toLowerCase().includes(q)) ||
          st.nameZh?.includes(q) ||
          st.nameMs?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [stationSearch, stations]);

  const getStationDisplayName = (st: StationData) => {
    if (language === 'zh' && st.nameZh) return st.nameZh;
    if (language === 'ms' && st.nameMs) return st.nameMs;
    if (language === 'ta' && st.nameTa) return st.nameTa;
    if (language === 'my' && st.nameMy) return st.nameMy;
    return st.name;
  };

  const decibels = station.accessibility.averageDecibels;
  const isQuiet = decibels < 70;

  // Active lift maintenance alerts for this station
  const activeLiftAlerts = useMemo(() => {
    return liftMaintenance.filter(
      (m) =>
        m.stationName?.toLowerCase().includes(station.name.toLowerCase()) ||
        station.codes.some((code) => m.stationCode?.toUpperCase() === code.toUpperCase())
    );
  }, [liftMaintenance, station]);

  const handleSpeakSummary = () => {
    const liftText = station.accessibility.liftAccessible
      ? 'Fully step-free with lifts from street to platform.'
      : 'Partial step-free access.';
    const quietText = `Noise level is ${decibels} decibels. Quietest exit is ${station.accessibility.quietExits.join(', ')}.`;
    const boardingText = `Wheelchair boarding at doors ${station.accessibility.wheelchairBoardingDoors.join(' and ')}.`;
    VoiceService.speak(`${station.name} Station. ${liftText} ${boardingText} ${quietText}`, language);
  };

  const handleRequestRamp = () => {
    setRampRequested(true);
    setTimeout(() => {
      setRampRequested(false);
    }, 4000);
  };

  // Quick major interchange shortcuts
  const popularStations = [
    { id: 'dhoby-ghaut', label: 'Dhoby Ghaut' },
    { id: 'jurong-east', label: 'Jurong East' },
    { id: 'orchard', label: 'Orchard' },
    { id: 'raffles-place', label: 'Raffles Place' },
    { id: 'woodlands', label: 'Woodlands' },
  ];

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto animate-in fade-in duration-150">
      {/* 1. CALM STATION HEADER */}
      <div
        id="calm-access-station-header"
        className={`p-4 rounded-2xl border transition-all ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              }`}
            >
              <Accessibility size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold">{t.sensoryAccessTitle}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.accessPageSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpeakSummary}
            className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
              isYellowBlack
                ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t.listenBtn}
            aria-label={t.listenBtn}
          >
            <Volume2 size={15} />
            <span>{t.listenBtn}</span>
          </button>
        </div>

        {/* Compact Station Search */}
        <div className="relative mb-2">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={stationSearch}
            onChange={(e) => setStationSearch(e.target.value)}
            placeholder={t.changeStationPlaceholder}
            className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border font-medium outline-none transition-all ${
              isYellowBlack
                ? 'bg-black border-yellow-400 text-yellow-300 placeholder:text-yellow-600 focus:ring-1 focus:ring-yellow-400'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500/20'
            }`}
          />
          {stationSearch && (
            <button
              type="button"
              onClick={() => setStationSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    if (onSelectStation) onSelectStation(st.id);
                    setStationSearch('');
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {st.codes.join(' / ')}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{st.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {st.accessibility.liftAccessible ? '✓ Step-Free' : 'Partial'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Station Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {popularStations.map((hub) => {
            const isCurrent = station.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => onSelectStation && onSelectStation(hub.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? isYellowBlack
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {hub.label}
              </button>
            );
          })}
        </div>

        {/* Current Inspected Station Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {getStationDisplayName(station)}
            </span>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {station.codes.join(' / ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {station.lines.map((l) => (
              <span
                key={l}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                style={{ backgroundColor: MRT_LINE_META[l]?.color }}
              >
                {MRT_LINE_META[l]?.shortLabel || l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CALM COMMUTE TOGGLE (LOW-SENSORY MODE) */}
      <div
        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          isLowSensoryActive
            ? isYellowBlack
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
              : 'bg-purple-50/90 border-purple-200 text-purple-900 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200'
            : isYellowBlack
            ? 'bg-black border-yellow-400/60 text-yellow-400'
            : 'bg-white border-slate-200/90 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isLowSensoryActive
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {isLowSensoryActive ? <Sparkles size={18} /> : <VolumeX size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold">
                {isLowSensoryActive ? t.calmCommuteActive : t.calmCommuteInactive}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t.calmCommuteDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLowSensory}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            isLowSensoryActive
              ? isYellowBlack
                ? 'bg-yellow-400 text-black font-extrabold'
                : 'bg-purple-600 text-white shadow-xs'
              : isYellowBlack
              ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {isLowSensoryActive ? t.turnOff : t.turnOn}
        </button>
      </div>

      {/* 3. CORE ESSENTIAL ACCESSIBILITY CARDS (3 CLEAR CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Step-Free & Lifts */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.liftsAndStepFree}
            </span>
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck size={14} />
            </span>
          </div>

          <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
            {activeLiftAlerts.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle size={14} /> Maintenance
              </span>
            ) : station.accessibility.liftAccessible ? (
              t.stepFreeAvailable
            ) : (
              t.stepFreePartial
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {t.stepFreeDesc}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <strong>{t.rampExitsLabel}</strong> {station.accessibility.rampExits.join(', ')}
          </div>
        </div>

        {/* Card 2: Priority Boarding Doors */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.wheelchairBoarding}
            </span>
            <span className="p-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Accessibility size={14} />
            </span>
          </div>

          <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
            {t.doorsLabel} {station.accessibility.wheelchairBoardingDoors.join(' & ')}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {t.boardingDoorsDesc}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <strong>{t.faregateLabel}</strong> {station.accessibility.wideGantry ? t.wideGantryText : t.standardGantryText}
          </div>
        </div>

        {/* Card 3: Noise & Quiet Exit */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-400'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.noiseSensoryTitle}
            </span>
            <span
              className={`p-1 rounded-md ${
                isQuiet
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <Volume2 size={14} />
            </span>
          </div>

          <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
            {decibels} dB ({isQuiet ? t.lowSensoryBadge : t.moderateLevel})
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {t.recommendedCar} <strong>{t.car1or6}</strong>
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <strong>{t.quietestExit}</strong> {station.accessibility.quietExits[0] || 'Exit A'}
          </div>
        </div>
      </div>

      {/* 4. STATION ASSISTANCE ACTIONS */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 shadow-2xs text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.needStationAssistance}
          </span>
          <span className="text-[10px] text-slate-400">{t.stationStaffOnDuty}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Quick Ramp Request Button */}
          <button
            type="button"
            onClick={handleRequestRamp}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              rampRequested
                ? 'bg-emerald-600 text-white'
                : isYellowBlack
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
            }`}
          >
            {rampRequested ? (
              <>
                <Check size={14} />
                <span>{t.staffNotified}</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span>{t.requestBoardingRamp}</span>
              </>
            )}
          </button>

          {/* SMRT Helpline */}
          <a
            href="tel:18003368900"
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone size={13} className="text-emerald-600" />
            <span>SMRT: 1800-336-8900</span>
          </a>

          {/* SBS Transit Helpline */}
          <a
            href="tel:18002872727"
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone size={13} className="text-purple-600" />
            <span>SBS: 1800-287-2727</span>
          </a>
        </div>

        {rampRequested && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check size={15} className="shrink-0 text-emerald-600" />
            <span>
              {t.staffNotifiedDesc}
            </span>
          </div>
        )}
      </div>

      {/* 5. OPTIONAL MORE FACILITIES (COLLAPSED BY DEFAULT TO PREVENT OVERWHELM) */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 shadow-2xs text-slate-800'
        }`}
      >
        <button
          type="button"
          onClick={() => setShowMoreFacilities(!showMoreFacilities)}
          className="w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="text-slate-700 dark:text-slate-300">
            {showMoreFacilities ? t.moreFacilitiesHide : t.moreFacilitiesShow}
          </span>
          {showMoreFacilities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showMoreFacilities && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">{t.accessibleToilet}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.concourseLevel}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">{t.babyCare}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.available}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">{t.hearingLoop}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.passengerServiceCounter}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">{t.tactilePavingLabel}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.streetToPlatform}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-400">{t.heartZone}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t.nearPassengerService}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
