import React from 'react';
import { AlertTriangle, Bell, ExternalLink, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { TelegramMrtPost, ContrastMode, MRTLineCode } from '../types';
import { MRT_LINE_META } from '../data/translations';

interface TelegramDisruptionAlertBannerProps {
  alert: TelegramMrtPost;
  onDismiss: () => void;
  onOpenFeedModal: () => void;
  onApplyReroute?: () => void;
  contrastMode: ContrastMode;
}

export const TelegramDisruptionAlertBanner: React.FC<TelegramDisruptionAlertBannerProps> = ({
  alert,
  onDismiss,
  onOpenFeedModal,
  onApplyReroute,
  contrastMode,
}) => {
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const primaryLine = (alert.lines[0] as MRTLineCode) || 'EWL';
  const lineMeta = MRT_LINE_META[primaryLine];

  return (
    <div
      id="telegram-route-disruption-banner"
      role="alert"
      aria-live="assertive"
      className={`relative z-40 mx-2 mb-3 p-3.5 rounded-2xl border-2 shadow-lg transition-all animate-in slide-in-from-top-3 duration-300 ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-300'
          : isHighContrastDark
          ? 'bg-red-950/90 border-red-500 text-red-100'
          : 'bg-gradient-to-br from-red-50 to-amber-50 border-red-400 text-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 flex-1">
          {/* Flashing Warning Icon */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center font-black shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Route Disruption Alert
              </span>

              {alert.lines.map((ln) => {
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

              {alert.delayMinutes > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-black">
                  +{alert.delayMinutes}m delay
                </span>
              )}

              <span className="text-[10px] opacity-75 font-mono">
                {alert.sgTime}
              </span>
            </div>

            {/* Impact Reason */}
            <p className="text-xs font-black mt-1 text-red-700 dark:text-red-300 leading-snug">
              {alert.routeImpactReason || '⚠️ An active delay affects your planned train journey!'}
            </p>

            {/* Message Body from Telegram */}
            <p className="text-xs mt-1 font-medium line-clamp-2 opacity-90 leading-relaxed">
              "{alert.text}"
            </p>

            {/* Action Bar */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {onApplyReroute && (
                <button
                  type="button"
                  onClick={onApplyReroute}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Avoid Delay & Reroute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onOpenFeedModal}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-white flex items-center gap-1 transition-colors"
              >
                <Bell className="w-3 h-3 text-[#229ED9]" />
                <span>View Telegram @sgmrt</span>
              </button>

              <a
                href={alert.url || 'https://t.me/s/sgmrt'}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] font-bold text-[#229ED9] hover:underline flex items-center gap-0.5 ml-auto"
              >
                <span>Channel Post</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Close / Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss disruption alert"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
