import React, { useState, useEffect } from 'react';
import { WifiOff, SlidersHorizontal, Clock, Bell } from 'lucide-react';
import appLogo from '../assets/images/mrt_train_logo_1789760133993.jpg';
import { AppTheme, ContrastMode, FontSizeScale, LanguageCode } from '../types';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { THEME_CONFIG } from '../utils/theme';
import { MobileSettingsSheet } from './MobileSettingsSheet';
import { getSgTimeString } from '../utils/singaporeTime';

interface HeaderProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  contrastMode: ContrastMode;
  onToggleContrast: () => void;
  fontSize: FontSizeScale;
  onFontSizeChange: (size: FontSizeScale) => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
  onOpenMap: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isSimpleMode?: boolean;
  onToggleSimpleMode?: () => void;
  onOpenTelegramModal?: () => void;
  telegramAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  contrastMode,
  onToggleContrast,
  fontSize,
  onFontSizeChange,
  offlineMode,
  onToggleOffline,
  theme,
  onThemeChange,
  isSimpleMode = false,
  onToggleSimpleMode,
  onOpenTelegramModal,
  telegramAlertCount = 0,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sgTime, setSgTime] = useState(getSgTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSgTime(getSgTimeString());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;

  const isHighContrastYellow = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const mrtLines = Object.entries(MRT_LINE_META).filter(([, meta]) => meta.category === 'MRT');
  const lrtLines = Object.entries(MRT_LINE_META).filter(([, meta]) => meta.category === 'LRT');

  return (
    <>
      <header
        id="mobile-app-header"
        className={`sticky top-0 z-30 transition-colors border-b backdrop-blur-md ${
          isHighContrastYellow
            ? 'bg-black/95 text-yellow-400 border-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-950/95 text-white border-slate-800'
            : 'bg-white/95 text-slate-900 border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between">
          {/* Brand + Mascot */}
          <div className="flex items-center gap-2.5">
            <div
              id="app-brand-logo"
              className={`w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${
                isHighContrastYellow
                  ? 'ring-1.5 ring-yellow-400 bg-black'
                  : 'border border-slate-200 bg-white shadow-xs'
              }`}
              aria-label="Railly Lost mascot"
            >
              <img
                src={appLogo}
                alt="Railly Lost logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight">Railly</span>
                <span className={`text-base font-extrabold tracking-tight ${isHighContrastYellow ? 'text-yellow-300' : themeStyle.headerBrandAccent}`}>
                  Lost
                </span>
                {offlineMode ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-0.5">
                    <WifiOff size={10} />
                    <span>{t.tunnelStatus}</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t.liveStatus}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 line-clamp-1">
                {t.headerSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick 1-Tap Font Size Cycle Button */}
            <button
              type="button"
              id="header-quick-font-btn"
              onClick={() => {
                const nextSize: Record<FontSizeScale, FontSizeScale> = {
                  'a': 'a+',
                  'a+': 'a++',
                  'a++': 'a+++',
                  'a+++': 'a',
                  'normal': 'large',
                  'large': 'extra-large',
                  'extra-large': 'huge',
                  'huge': 'normal'
                };
                onFontSizeChange(nextSize[fontSize] || 'a+');
              }}
              className={`min-w-[38px] h-8 px-2 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-0.5 ${
                isHighContrastYellow
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
              }`}
              title="Change Text Size (A, A+, A++, A+++)"
              aria-label="Change Text Size"
            >
              <span>{fontSize}</span>
            </button>

            {/* Quick Simple / Senior Mode Toggle Button */}
            {onToggleSimpleMode && (
              <button
                type="button"
                id="header-simple-mode-toggle"
                onClick={onToggleSimpleMode}
                className={`h-8 px-2.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1 ${
                  isSimpleMode
                    ? isHighContrastYellow
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : isHighContrastYellow
                    ? 'border-yellow-400 text-yellow-300 bg-transparent'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
                title={isSimpleMode ? (t.detailedMode || 'Switch to Detailed Mode') : (t.simpleMode || 'Switch to Senior Easy Mode')}
              >
                <span>{isSimpleMode ? '👵 Easy' : '⚡ Full'}</span>
              </button>
            )}

            {/* Singapore Local Time indicator */}
            <div
              id="header-singapore-time-badge"
              className={`hidden sm:flex px-2 py-1 rounded-xl text-[11px] font-extrabold items-center gap-1 border ${
                isHighContrastYellow
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200'
              }`}
              title="Singapore Local Time (SGT, UTC+8)"
            >
              <Clock size={12} className="text-emerald-500 animate-pulse" />
              <span>{sgTime} SGT</span>
            </div>

            {/* Telegram Channel Alerts Trigger Button */}
            {onOpenTelegramModal && (
              <button
                type="button"
                id="header-telegram-alerts-btn"
                onClick={onOpenTelegramModal}
                className={`relative p-2 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center justify-center ${
                  isHighContrastYellow
                    ? 'border border-yellow-400 bg-yellow-400/20 text-yellow-300'
                    : telegramAlertCount > 0
                    ? 'bg-red-500 text-white shadow-xs animate-bounce'
                    : 'bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 border border-[#229ED9]/30'
                }`}
                title="Telegram MRT Alerts (@sgmrt)"
                aria-label="Telegram MRT Alerts"
              >
                <Bell size={16} />
                {telegramAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {telegramAlertCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Settings Button (Sheet Trigger) */}
            <button
              type="button"
              id="mobile-header-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1 ${
                isHighContrastYellow
                  ? 'bg-yellow-400 text-black font-extrabold'
                  : `${themeStyle.softBg} ${themeStyle.primaryText} border ${themeStyle.border}`
              }`}
              title={t.openSettingsTooltip}
              aria-label={t.openSettingsTooltip}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Categorized MRT & LRT Lines horizontal scrollbar */}
        <div
          id="mobile-header-lines-bar"
          className="border-t border-slate-100 dark:border-slate-800/80 px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-2.5 max-w-md mx-auto"
        >
          {/* Category 1: MRT LINES */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              id="header-mrt-category-label"
              className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                isHighContrastYellow
                  ? 'text-yellow-400 font-extrabold'
                  : isHighContrastDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {t.mrtLines}
            </span>
            <div className="flex items-center gap-1">
              {mrtLines.map(([code, meta]) => (
                <span
                  key={code}
                  id={`header-mrt-line-${code.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-2xs shrink-0"
                  style={{ backgroundColor: meta.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-85" />
                  <span>{meta.shortLabel || code}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Clean Subtle Divider */}
          <span className="h-3 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" aria-hidden="true" />

          {/* Category 2: LRT LINES */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              id="header-lrt-category-label"
              className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                isHighContrastYellow
                  ? 'text-yellow-400 font-extrabold'
                  : isHighContrastDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {t.lrtLines}
            </span>
            <div className="flex items-center gap-1">
              {lrtLines.map(([code, meta]) => (
                <span
                  key={code}
                  id={`header-lrt-line-${code.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-2xs shrink-0"
                  style={{ backgroundColor: meta.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-85" />
                  <span>{meta.shortLabel || code}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Bottom Sheet */}
      <MobileSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={onLanguageChange}
        contrastMode={contrastMode}
        onContrastChange={(mode) => {
          if (mode !== contrastMode) onToggleContrast();
        }}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        offlineMode={offlineMode}
        onToggleOffline={onToggleOffline}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </>
  );
};
