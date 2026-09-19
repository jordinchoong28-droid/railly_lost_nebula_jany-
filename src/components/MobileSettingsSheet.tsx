import React from 'react';
import { X, Palette, Globe, Eye, ALargeSmall, WifiOff, Wifi, RotateCcw, Check } from 'lucide-react';
import { AppTheme, ContrastMode, FontSizeScale, LanguageCode } from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { TRANSLATIONS } from '../data/translations';

interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  contrastMode: ContrastMode;
  onContrastChange: (mode: ContrastMode) => void;
  fontSize: FontSizeScale;
  onFontSizeChange: (size: FontSizeScale) => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isSimpleMode?: boolean;
  onToggleSimpleMode?: () => void;
}

export const MobileSettingsSheet: React.FC<MobileSettingsSheetProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  contrastMode,
  onContrastChange,
  fontSize,
  onFontSizeChange,
  offlineMode,
  onToggleOffline,
  theme,
  onThemeChange,
  isSimpleMode = false,
  onToggleSimpleMode,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const themesList: AppTheme[] = ['pink', 'yellow', 'green', 'blue'];

  const languagesList: { code: LanguageCode; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'Singapore' },
    { code: 'zh', name: 'Chinese', native: '华语 (Mandarin)' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'my', name: 'Burmese', native: 'မြန်မာဘာသာ' },
  ];

  const fontOptions: { id: FontSizeScale; label: string; desc: string }[] = [
    { id: 'a', label: 'a', desc: 'Standard (15px)' },
    { id: 'a+', label: 'a+', desc: 'Comfort (17px)' },
    { id: 'a++', label: 'a++', desc: 'Senior (19.5px)' },
    { id: 'a+++', label: 'a+++', desc: 'Jumbo (22px)' },
  ];

  const getThemeLabel = (th: AppTheme) => {
    switch (th) {
      case 'pink':
        return { name: t.themePink || 'Sakura Pink', emoji: '🌸' };
      case 'yellow':
        return { name: t.themeYellow || 'Sunshine', emoji: '☀️' };
      case 'green':
        return { name: t.themeGreen || 'Parkland', emoji: '🌿' };
      case 'blue':
        return { name: t.themeBlue || 'Marina Blue', emoji: '🌊' };
    }
  };

  const instantSavedText =
    language === 'zh'
      ? '选项即点即生效，无需手动保存'
      : language === 'ms'
      ? 'Pilihan disimpan serta-merta'
      : language === 'ta'
      ? 'அமைப்புகள் உடனே செயல்படும்'
      : language === 'my'
      ? 'ရွေးချယ်မှုများ ချက်ချင်းအကျိုးသက်ရောက်သည်'
      : 'All settings apply instantly';

  return (
    <div
      id="mobile-settings-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mobile-settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
        className={`w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom duration-200 transition-colors ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Drag Handle for Mobile */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-1 sm:hidden" />

        {/* Header with High-Accessibility Close button */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 id="settings-sheet-title" className="text-base font-extrabold tracking-tight flex items-center gap-1.5">
              <span>⚙️</span>
              <span>{t.settingsTitle || 'App Preferences & Accessibility'}</span>
            </h2>
            <p className="text-[11px] opacity-75 mt-0.5">
              {instantSavedText}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all shadow-2xs ${
              isYellowBlack
                ? 'bg-yellow-400 text-black'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            aria-label={t.close || 'Close settings'}
          >
            <X size={16} />
            <span>{t.close || 'Close'}</span>
          </button>
        </div>

        {/* Highlighted Simple Senior Mode Toggle for All Age Groups */}
        {onToggleSimpleMode && (
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
              isSimpleMode
                ? isYellowBlack
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-300 text-slate-900'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👵👴</span>
              <div>
                <div className="text-sm font-black flex items-center gap-1.5">
                  <span>{t.simpleMode || 'Easy Senior Mode'}</span>
                  {isSimpleMode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-black">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-80 max-w-[220px] leading-tight mt-0.5">
                  {t.simpleModeDesc || 'Large text, big buttons, and simple 3-step directions'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSimpleMode}
              className={`min-h-[44px] min-w-[70px] px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
                isSimpleMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : isYellowBlack
                  ? 'bg-yellow-400 text-black'
                  : 'border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {isSimpleMode ? 'ON ✓' : 'OFF'}
            </button>
          </div>
        )}

        {/* 1. Theme Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Palette size={14} />
            <span>{t.accentTheme || 'Accent Theme'}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {themesList.map((th) => {
              const conf = THEME_CONFIG[th];
              const isSelected = theme === th;
              const { name, emoji } = getThemeLabel(th);
              return (
                <button
                  key={th}
                  type="button"
                  onClick={() => onThemeChange(th)}
                  className={`min-h-[52px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    isSelected
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400'
                        : `${conf.primaryBg} text-white shadow-xs ring-2 ring-offset-1 ring-slate-400`
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60'
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-[10px] truncate max-w-full font-bold">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Language Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Globe size={14} />
            <span>{t.languageLabel || 'Language'} / 语言</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {languagesList.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onLanguageChange(l.code)}
                  className={`min-h-[50px] p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-extrabold ring-2 ring-yellow-400'
                        : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-extrabold ring-2 ring-offset-1 ring-slate-300`
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm">{l.name}</div>
                    <div className="text-[11px] opacity-80">{l.native}</div>
                  </div>
                  {isSelected && <Check size={18} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Text Size for Seniors & Clear Reading */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ALargeSmall size={14} />
              <span>{t.textSizingLabel || 'Text Sizing & Readability'}</span>
            </div>
            {fontSize !== 'a' && fontSize !== 'normal' && (
              <button
                type="button"
                onClick={() => onFontSizeChange('a')}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 min-h-[36px] px-2"
              >
                <RotateCcw size={12} />
                <span>{t.textReset || 'Reset (a)'}</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {fontOptions.map((opt) => {
              const isSelected =
                fontSize === opt.id ||
                (fontSize === 'normal' && opt.id === 'a') ||
                (fontSize === 'large' && opt.id === 'a+') ||
                (fontSize === 'extra-large' && opt.id === 'a++') ||
                (fontSize === 'huge' && opt.id === 'a+++');
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`btn-font-size-${opt.id.replace('+', 'plus')}`}
                  onClick={() => onFontSizeChange(opt.id)}
                  className={`min-h-[56px] py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400/25 text-yellow-300 font-black ring-2 ring-yellow-400'
                        : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-black ring-2 ring-offset-1 ring-slate-300`
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-base font-extrabold flex items-center gap-0.5">
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 text-center leading-tight">
                    {opt.id === 'a' ? '15px' : opt.id === 'a+' ? '17px' : opt.id === 'a++' ? '19.5px' : '22px'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Display Contrast */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Eye size={14} />
            <span>{t.contrastLabel || 'Display Contrast'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard' as ContrastMode, label: t.contrastStandard || 'Standard' },
              { id: 'high-contrast-dark' as ContrastMode, label: t.contrastDark || 'Dark Mode' },
              { id: 'high-contrast-light' as ContrastMode, label: t.contrastYellowBlack || 'Yellow/Black' },
            ].map((c) => {
              const isSelected = contrastMode === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onContrastChange(c.id)}
                  className={`min-h-[46px] p-2 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center ${
                    isSelected
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400 text-black font-extrabold'
                        : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-extrabold ring-2 ring-offset-1 ring-slate-300`
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Underground Tunnel Mode */}
        <div className="p-3.5 rounded-2xl border flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${offlineMode ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
              {offlineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>🚇</span>
                <span>{t.tunnelModeLabel || 'Underground Tunnel Mode'}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-tight mt-0.5">
                {t.tunnelModeDesc || 'Offline cached maps and directions'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleOffline}
            className={`min-h-[44px] min-w-[58px] px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
              offlineMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {offlineMode ? 'ON ✓' : 'OFF'}
          </button>
        </div>

        {/* Reassuring Instant Confirmation Indicator (replaces confusing Save button) */}
        <div className="pt-1 pb-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <span>{instantSavedText}</span>
        </div>
      </div>
    </div>
  );
};
