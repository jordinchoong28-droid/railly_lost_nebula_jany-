import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Users,
  Accessibility,
  Droplets,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  AppTheme,
  ContrastMode,
  LiftMaintenanceItem,
  MRTLineCode,
  PublicFloodAlertItem,
  StationCrowdDensityItem,
  StructuredDisruptionFeedItem,
  LanguageCode,
} from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';

interface LiveTransitFeedsPanelProps {
  disruptions: StructuredDisruptionFeedItem[];
  crowdDensities: StationCrowdDensityItem[];
  liftMaintenance: LiftMaintenanceItem[];
  floodAlerts: PublicFloodAlertItem[];
  onRefreshDisruptions: () => void;
  onRefreshCrowd: () => void;
  onRefreshLifts: () => void;
  onRefreshFloods: () => void;
  onSelectStation?: (stationId: string) => void;
  onOpenNoticeParser?: (notice?: string) => void;
  onOpenTelegramModal?: () => void;
  telegramCount?: number;
  contrastMode: ContrastMode;
  theme: AppTheme;
  language?: LanguageCode;
}

export const LiveTransitFeedsPanel: React.FC<LiveTransitFeedsPanelProps> = ({
  disruptions,
  crowdDensities,
  liftMaintenance,
  floodAlerts,
  onRefreshDisruptions,
  onRefreshCrowd,
  onRefreshLifts,
  onRefreshFloods,
  onSelectStation,
  onOpenNoticeParser,
  onOpenTelegramModal,
  telegramCount = 0,
  contrastMode,
  theme,
  language = 'en',
}) => {
  type FeedTab = 'disruptions' | 'crowd' | 'lifts' | 'floods';
  const [activeSubTab, setActiveSubTab] = useState<FeedTab>('disruptions');
  const [selectedLineFilter, setSelectedLineFilter] = useState<MRTLineCode | 'ALL'>('ALL');
  const [countdownSeconds, setCountdownSeconds] = useState(180); // 3-min countdown for crowd density

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  // Defensive array checks to prevent runtime errors
  const safeDisruptions = Array.isArray(disruptions) ? disruptions : [];
  const safeCrowdDensities = Array.isArray(crowdDensities) ? crowdDensities : [];
  const safeLiftMaintenance = Array.isArray(liftMaintenance) ? liftMaintenance : [];
  const safeFloodAlerts = Array.isArray(floodAlerts) ? floodAlerts : [];

  // 3-minute countdown timer for Station Crowd Density auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          onRefreshCrowd();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefreshCrowd]);

  const minutesRemaining = Math.floor(countdownSeconds / 60);
  const secondsRemaining = countdownSeconds % 60;
  const formattedCountdown = `${minutesRemaining}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;

  const linesList: (MRTLineCode | 'ALL')[] = ['ALL', 'EWL', 'NSL', 'NEL', 'CCL', 'DTL', 'TEL'];

  const filteredCrowds = selectedLineFilter === 'ALL'
    ? safeCrowdDensities
    : safeCrowdDensities.filter((c) => c.line === selectedLineFilter);

  return (
    <div
      id="live-transit-feeds-panel"
      className={`rounded-2xl border p-3.5 transition-all shadow-xs ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-800'
      }`}
    >
      {/* 1. Header with Ad-Hoc / 3-Min Refresh Indicator */}
      <div className="flex items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isYellowBlack ? 'bg-yellow-400 text-black' : `${themeStyle.softBg} ${themeStyle.primaryText}`
            }`}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>Official Live Transit Feeds</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30">
                Ad-Hoc / 3-Min Sync
              </span>
            </h3>
            <p className="text-[10px] opacity-75 font-medium">
              Structured Alerts • Crowd Density • Lift Status • Flood Warnings
            </p>
          </div>
        </div>

        {/* Action button based on active sub tab */}
        <div>
          {activeSubTab === 'disruptions' && (
            <button
              type="button"
              id="btn-refresh-disruptions-adhoc"
              onClick={onRefreshDisruptions}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Ad-hoc refresh disruption feed"
            >
              <RefreshCw size={13} />
              <span className="text-[10px]">Ad-Hoc</span>
            </button>
          )}

          {activeSubTab === 'crowd' && (
            <button
              type="button"
              id="btn-refresh-crowd-density"
              onClick={() => {
                onRefreshCrowd();
                setCountdownSeconds(180);
              }}
              className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="3-minute auto refresh"
            >
              <Clock size={12} className="text-emerald-500" />
              <span className="text-[10px]">{formattedCountdown}</span>
            </button>
          )}

          {activeSubTab === 'lifts' && (
            <button
              type="button"
              id="btn-refresh-lifts-adhoc"
              onClick={onRefreshLifts}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Ad-hoc refresh station lift maintenance"
            >
              <RefreshCw size={13} />
              <span className="text-[10px]">Ad-Hoc</span>
            </button>
          )}

          {activeSubTab === 'floods' && (
            <button
              type="button"
              id="btn-refresh-floods-adhoc"
              onClick={onRefreshFloods}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Ad-hoc refresh public flood alerts"
            >
              <RefreshCw size={13} />
              <span className="text-[10px]">Ad-Hoc</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Tabs Bar: Disruptions | Crowd Density (3m) | Lifts (By Exit) | Flood Alerts */}
      <div className="grid grid-cols-4 gap-1.5 mt-2.5">
        {[
          { id: 'disruptions' as FeedTab, label: t.feedDisruptions, icon: AlertTriangle, badge: safeDisruptions.length },
          { id: 'crowd' as FeedTab, label: t.feedCrowd, icon: Users, badge: 'Live' },
          { id: 'lifts' as FeedTab, label: t.feedLifts, icon: Accessibility, badge: safeLiftMaintenance.filter(l => l.status === 'maintenance').length },
          { id: 'floods' as FeedTab, label: t.feedFloods, icon: Droplets, badge: safeFloodAlerts.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-feed-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                isActive
                  ? isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/25 text-yellow-300 font-extrabold ring-1 ring-yellow-400'
                    : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-extrabold ring-1 ring-offset-1 ring-slate-200`
                  : 'border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon size={14} />
                <span className="text-[11px] font-bold line-clamp-1">{tab.label}</span>
              </div>
              <span className="text-[9px] opacity-75 font-semibold mt-0.5">
                {typeof tab.badge === 'number' && tab.badge > 0 ? `${tab.badge} Active` : tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Telegram @sgmrt Live Channel Integration Banner */}
      {onOpenTelegramModal && (
        <button
          type="button"
          onClick={onOpenTelegramModal}
          id="btn-open-telegram-channel-feed"
          className={`w-full mt-2.5 p-2.5 rounded-xl border flex items-center justify-between transition-all ${
            isYellowBlack
              ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
              : 'border-[#229ED9]/40 bg-[#229ED9]/10 text-slate-800 dark:text-slate-100 hover:bg-[#229ED9]/15'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#229ED9] text-white flex items-center justify-center text-xs font-black shrink-0">
              ✈
            </div>
            <div className="text-left">
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>Telegram @sgmrt Live Feed</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#229ED9] text-white text-[9px] font-black uppercase">
                  Live Sync
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Direct public feed from t.me/s/sgmrt with automatic route delay alerts
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#229ED9] shrink-0 ml-2">
            View &rarr;
          </span>
        </button>
      )}

      {/* 3. SUB-TAB CONTENT 1: Official Train Disruption Feed */}
      {activeSubTab === 'disruptions' && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.feedDisruptions}
            </span>
            {onOpenNoticeParser && (
              <button
                type="button"
                id="btn-open-notice-parser-card"
                onClick={() => onOpenNoticeParser()}
                className={`text-[10px] font-black underline flex items-center gap-1 ${
                  isYellowBlack ? 'text-yellow-400' : themeStyle.primaryText
                }`}
              >
                <Sparkles size={11} />
                <span>{t.parseNoticeBtn}</span>
              </button>
            )}
          </div>

          {safeDisruptions.length === 0 && (
            <div className={`p-4 rounded-xl border text-center text-xs font-semibold ${
              isYellowBlack ? 'border-yellow-400 bg-black text-yellow-400' : 'border-slate-200 text-slate-500'
            }`}>
              {t.noDisruptionsActive}
            </div>
          )}

          {safeDisruptions.map((disrupt) => {
            const lineMeta = MRT_LINE_META[disrupt.line];
            const isReroute = disrupt.recommendation === 'reroute';

            return (
              <div
                key={disrupt.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                  isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : isReroute
                    ? 'border-rose-300/80 bg-rose-50/70 dark:border-rose-800/50 dark:bg-rose-950/30'
                    : 'border-amber-300/80 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/30'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: lineMeta?.color || '#009645' }}
                    >
                      {disrupt.line}
                    </span>
                    <span className="text-xs font-black">{disrupt.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Updated {disrupt.lastUpdated}
                  </span>
                </div>

                {/* Raw Official Message */}
                <p className="text-xs leading-relaxed font-medium">
                  {disrupt.officialNoticeRaw || disrupt.actionAdvice}
                </p>

                {/* Escalation Probability & Wait vs Reroute AI Advice */}
                <div
                  className={`p-2 rounded-lg border text-xs flex flex-col gap-1 ${
                    isReroute
                      ? 'border-rose-400/60 bg-rose-100/50 dark:bg-rose-900/40 text-rose-950 dark:text-rose-200'
                      : 'border-amber-400/60 bg-amber-100/50 dark:bg-amber-900/40 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                      <span>Recommendation: {disrupt.recommendation.toUpperCase()}</span>
                    </span>
                    <span className="text-[10px]">
                      Delay Escalation Risk: {disrupt.escalationProbability}%
                    </span>
                  </div>

                  <p className="text-[11px] leading-snug font-semibold">
                    {disrupt.actionAdvice}
                  </p>
                </div>

                {/* Free Bus Corridors */}
                {disrupt.freeBusActive && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-1.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span>Free Public Bus Shuttle Active: {disrupt.freeBusCorridor}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SUB-TAB CONTENT 2: Station Crowd Density (by Line, refreshed every 3 min) */}
      {activeSubTab === 'crowd' && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Station Crowdedness (Refreshed Every 3 Min)
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Auto-refresh in {formattedCountdown}
            </span>
          </div>

          {/* Line Filter Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {linesList.map((line) => {
              const isSelected = selectedLineFilter === line;
              const meta = line === 'ALL' ? null : MRT_LINE_META[line];
              return (
                <button
                  key={line}
                  type="button"
                  onClick={() => setSelectedLineFilter(line)}
                  className={`px-2 py-0.8 rounded-lg text-[10px] font-extrabold uppercase shrink-0 transition-all ${
                    isSelected
                      ? isYellowBlack
                        ? 'bg-yellow-400 text-black'
                        : `${themeStyle.buttonBg} text-white shadow-2xs`
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {line === 'ALL' ? 'All Lines' : meta?.shortLabel || line}
                </button>
              );
            })}
          </div>

          {/* Station Crowd Density Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCrowds.map((station) => {
              const lineMeta = MRT_LINE_META[station.line];
              return (
                <div
                  key={`${station.stationId}-${station.line}`}
                  className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                    isYellowBlack
                      ? 'border-yellow-400/50 bg-black'
                      : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-black text-white"
                        style={{ backgroundColor: lineMeta?.color || '#009645' }}
                      >
                        {station.line}
                      </span>
                      <span className="text-xs font-black">{station.stationName}</span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        station.crowdLevel === 'Extreme'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : station.crowdLevel === 'High'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {station.crowdLevel} ({station.percentage}%)
                    </span>
                  </div>

                  {/* Visual Density Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        station.percentage >= 80
                          ? 'bg-rose-500'
                          : station.percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${station.percentage}%` }}
                    />
                  </div>

                  {/* Next train carriages crowd mini preview */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                    <span>Cars 1-6 Crowd:</span>
                    <div className="flex items-center gap-0.5">
                      {station.nextTrainCarsCrowd.map((car, cIdx) => (
                        <span
                          key={cIdx}
                          className="w-3.5 h-3 rounded text-[8px] font-bold text-center text-white flex items-center justify-center"
                          style={{
                            backgroundColor: car >= 75 ? '#E11D48' : car >= 50 ? '#D97706' : '#059669',
                          }}
                          title={`Car ${cIdx + 1}: ${car}% full`}
                        >
                          {cIdx + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB CONTENT 3: Ad-Hoc Lift Maintenance at Stations (Down to individual lift and exit) */}
      {activeSubTab === 'lifts' && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ad-Hoc Station Lift Maintenance (By Individual Lift & Exit)
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Essential for Wheelchair Commuters
            </span>
          </div>

          {safeLiftMaintenance.length === 0 && (
            <div className={`p-4 rounded-xl border text-center text-xs font-semibold ${
              isYellowBlack ? 'border-yellow-400 bg-black text-yellow-400' : 'border-slate-200 text-slate-500'
            }`}>
              {t.allLiftsOperational}
            </div>
          )}
          {safeLiftMaintenance.map((lift) => {
            const isDown = lift.status === 'maintenance';
            return (
              <div
                key={lift.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  isYellowBlack
                    ? 'border-yellow-400/70 bg-yellow-400/10'
                    : isDown
                    ? 'border-rose-300/80 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/30'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">{lift.stationName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700">
                      {lift.liftId}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                      isDown
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : lift.status === 'intermittent'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {lift.status}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>Serves: </span>
                  <span className="underline decoration-dotted">{lift.servesExit}</span>
                </div>

                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  <span>Platform connection: {lift.platformServed}</span>
                </div>

                {isDown && (
                  <div className="mt-1 p-2 rounded-lg bg-rose-100/60 dark:bg-rose-900/40 border border-rose-300/60 dark:border-rose-800/60 text-xs">
                    <div className="text-[10px] font-bold text-rose-800 dark:text-rose-300">
                      Reason: {lift.reason} • Expected ready: {lift.expectedRestoration}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      ♿ Accessible Alternative: {lift.alternativeAccessiblePath}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SUB-TAB CONTENT 4: Public Flash Flood Alerts (Refreshed Ad-Hoc) */}
      {activeSubTab === 'floods' && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PUB Singapore Public Flood Alerts (Near MRT Stations)
            </span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
              Ad-Hoc Refresh
            </span>
          </div>

          {safeFloodAlerts.length === 0 && (
            <div className={`p-4 rounded-xl border text-center text-xs font-semibold ${
              isYellowBlack ? 'border-yellow-400 bg-black text-yellow-400' : 'border-slate-200 text-slate-500'
            }`}>
              {t.noFloodsReported}
            </div>
          )}

          {safeFloodAlerts.map((flood) => (
            <div
              key={flood.id}
              className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                isYellowBlack
                  ? 'border-yellow-400/80 bg-yellow-400/15 text-yellow-300 font-bold'
                  : 'border-sky-300/80 bg-sky-50/70 dark:border-sky-800/60 dark:bg-sky-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                  <Droplets size={14} className="text-sky-600 animate-bounce" />
                  <span>{flood.severity}: {flood.location}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-200/60 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200">
                  Water: {flood.waterLevelPercent}%
                </span>
              </div>

              <p className="text-[11px] leading-snug font-medium text-slate-700 dark:text-slate-300">
                {flood.impactOnCommuters}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Nearby MRT: {flood.nearbyStations.join(', ')}</span>
                <span>Agency: {flood.agency} ({flood.issuedAt})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
