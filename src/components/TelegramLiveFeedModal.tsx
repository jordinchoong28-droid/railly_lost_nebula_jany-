import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Bell,
  BellOff,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Bus,
  Clock,
  Sparkles,
  CheckCircle2,
  Share2,
  Volume2
} from 'lucide-react';
import { TelegramMrtPost, ContrastMode, CalculatedRoute, LanguageCode, MRTLineCode } from '../types';
import { MRT_LINE_META } from '../data/translations';
import { notificationService } from '../services/notificationService';

interface TelegramLiveFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: TelegramMrtPost[];
  isLoading: boolean;
  onRefresh: () => void;
  lastRefreshed: string;
  calculatedRoute: CalculatedRoute | null;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  contrastMode: ContrastMode;
  language: LanguageCode;
  onSimulateDelay?: (line: MRTLineCode, text: string) => void;
}

export const TelegramLiveFeedModal: React.FC<TelegramLiveFeedModalProps> = ({
  isOpen,
  onClose,
  posts,
  isLoading,
  onRefresh,
  lastRefreshed,
  calculatedRoute,
  notificationsEnabled,
  onToggleNotifications,
  contrastMode,
  language,
  onSimulateDelay,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'my_route'>('all');
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  if (!isOpen) return null;

  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const routeLines = calculatedRoute ? calculatedRoute.linesUsed : [];
  const routeAffectedPosts = posts.filter((p) => p.affectsUserRoute);

  const displayedPosts = filterMode === 'my_route' ? routeAffectedPosts : posts;

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      onToggleNotifications(true);
      notificationService.sendNotification('🔔 MRT Route Alerts Active', {
        body: 'You will now receive automatic notifications for any delays or disruptions affecting your planned journey.',
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3500);
    } else {
      onToggleNotifications(false);
    }
  };

  const handleSendTestNotification = () => {
    notificationService.sendNotification('⚠️ Test Alert: East-West Line Delay', {
      body: 'Track circuit inspection near Outram Park. Added 12 mins travel time. Bridging buses on standby.',
      tag: 'test-alert',
    });
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3500);
  };

  const handleTriggerSimulatedRouteDelay = () => {
    const primaryLine = routeLines[0] || 'EWL';
    const lineName = MRT_LINE_META[primaryLine]?.name || primaryLine;
    const sampleText = `[SMRT Travel Notice] ${lineName}: Signaling fault reported. Trains running at reduced speed, add 15 mins travel time. Free bridging bus services activated.`;
    if (onSimulateDelay) {
      onSimulateDelay(primaryLine, sampleText);
    }
  };

  return (
    <div
      id="telegram-feed-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="telegram-feed-modal-content"
        className={`w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom-5 duration-200 ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-300'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Telegram Branding */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-[#229ED9]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Telegram Plane Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.63 3.72-.53.36-1.02.54-1.45.53-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.89.03-.25.38-.51 1.07-.78 4.2-1.82 7.01-3.03 8.42-3.62 4.01-1.68 4.84-1.97 5.39-1.98.12 0 .39.03.56.17.15.12.19.28.21.43-.01.07.01.21 0 .28z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Singapore MRT Alerts</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#229ED9] text-white uppercase">
                  @sgmrt
                </span>
              </div>
              <p className="text-xs opacity-75 font-medium">
                Live official notices from SMRT, SBS Transit & LTA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Push Alert Configuration Card */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              notificationsEnabled
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white mt-0.5 ${
                    notificationsEnabled ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>Route Disruption Push Alerts</span>
                    {notificationsEnabled ? (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-md">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.2 rounded-md">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                    Sends automatic pop-up alerts with audio chimes when a delay or fault impacts your planned route, without needing you to open the app.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={notificationsEnabled ? () => onToggleNotifications(false) : handleRequestPermission}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors shadow-2xs ${
                  notificationsEnabled
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {notificationsEnabled ? 'Turn Off' : 'Enable Alerts'}
              </button>
            </div>

            {/* Test alert trigger */}
            <div className="mt-2.5 pt-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] opacity-75">
                Test audio chime & browser push:
              </span>
              <div className="flex items-center gap-2">
                {onSimulateDelay && (
                  <button
                    type="button"
                    onClick={handleTriggerSimulatedRouteDelay}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 hover:bg-amber-300 transition-colors"
                  >
                    Simulate Route Delay
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600" />
                  <span>{testNotificationSent ? 'Sent!' : 'Send Test Alert'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active User Route Status Indicator */}
          {calculatedRoute && (
            <div className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-blue-900 dark:text-blue-200">
                  Monitoring Your Journey Lines:
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {routeLines.map((ln) => {
                    const meta = MRT_LINE_META[ln];
                    return (
                      <span
                        key={ln}
                        className="px-2 py-0.5 rounded-md text-[10px] font-black text-white"
                        style={{ backgroundColor: meta?.color || '#007A3D' }}
                      >
                        {ln} {meta?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {routeAffectedPosts.length > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                  {routeAffectedPosts.length} Alert affecting you
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lines Clear
                </span>
              )}
            </div>
          )}

          {/* Controls: Filter Pills & Refresh Button */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  filterMode === 'all'
                    ? 'bg-[#229ED9] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Updates ({posts.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('my_route')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                  filterMode === 'my_route'
                    ? 'bg-red-600 text-white shadow-xs'
                    : routeAffectedPosts.length > 0
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>My Route Alerts ({routeAffectedPosts.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-60 font-mono hidden xs:inline">
                {lastRefreshed}
              </span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh Telegram feed"
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {displayedPosts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {filterMode === 'my_route'
                    ? 'No disruptions currently reported on your planned route.'
                    : 'No messages found from channel.'}
                </p>
                <p className="text-[11px] opacity-70 mt-1">
                  Trains are running normally on all monitored sectors.
                </p>
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isAffected = post.affectsUserRoute;
                return (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isAffected
                        ? 'border-red-400 bg-red-50/80 dark:bg-red-950/40 shadow-sm'
                        : isYellowBlack
                        ? 'border-yellow-400/50 bg-black'
                        : isHighContrastDark
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isAffected && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            AFFECTS YOUR ROUTE
                          </span>
                        )}

                        {post.lines.map((ln) => {
                          const meta = MRT_LINE_META[ln as MRTLineCode];
                          return (
                            <span
                              key={ln}
                              className="px-2 py-0.5 rounded-md text-[10px] font-black text-white"
                              style={{ backgroundColor: meta?.color || '#D42E12' }}
                            >
                              {ln}
                            </span>
                          );
                        })}

                        {post.delayMinutes > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-black">
                            +{post.delayMinutes}m delay
                          </span>
                        )}

                        {post.freeBusAvailable && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white flex items-center gap-1">
                            <Bus className="w-3 h-3" />
                            Free Bus Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] opacity-70 font-mono ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{post.sgTime}</span>
                      </div>
                    </div>

                    {/* Impact reason if affecting route */}
                    {isAffected && post.routeImpactReason && (
                      <div className="text-xs font-black text-red-700 dark:text-red-300 mb-2">
                        {post.routeImpactReason}
                      </div>
                    )}

                    {/* Text Body */}
                    <p className="text-xs leading-relaxed whitespace-pre-line font-medium opacity-90">
                      {post.text}
                    </p>

                    {/* Affected Stations */}
                    {post.stationNames.length > 0 && (
                      <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                        <span className="text-[10px] font-bold opacity-60">Stations:</span>
                        {post.stationNames.map((st) => (
                          <span
                            key={st}
                            className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-semibold"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Channel Footer Link */}
                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {post.postId}
                      </span>
                      <a
                        href={post.url || 'https://t.me/s/sgmrt'}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[11px] font-bold text-[#229ED9] hover:underline flex items-center gap-1"
                      >
                        <span>View on Telegram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <a
            href="https://t.me/s/sgmrt"
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs font-bold text-[#229ED9] hover:underline flex items-center gap-1"
          >
            <span>Open t.me/s/sgmrt in Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
