import React from 'react';
import { Route, Users, Map, HeartHandshake, Bot } from 'lucide-react';
import { AppTheme, ContrastMode, LanguageCode, MobileTab } from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { TRANSLATIONS } from '../data/translations';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  theme: AppTheme;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  contrastMode,
  theme,
}) => {
  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const tabs: { id: MobileTab; label: string; icon: React.ElementType }[] = [
    { id: 'route', label: t.tabRoute, icon: Route },
    { id: 'carriage', label: t.tabCarriages, icon: Users },
    { id: 'map', label: t.tabMap, icon: Map },
    { id: 'accessibility', label: t.tabAccess, icon: HeartHandshake },
    { id: 'chat', label: t.tabAiGuide, icon: Bot },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto border-t backdrop-blur-md transition-colors ${
        isYellowBlack
          ? 'bg-black/95 text-yellow-400 border-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-950/95 text-slate-100 border-slate-800'
          : 'bg-white/95 text-slate-700 border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="grid grid-cols-5 items-center px-1 pt-1.5 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all tap-bounce relative ${
                isActive
                  ? isYellowBlack
                    ? 'text-yellow-300 font-extrabold'
                    : isHighContrastDark
                    ? 'text-white font-bold'
                    : `${themeStyle.primaryText} font-bold`
                  : isYellowBlack
                  ? 'text-yellow-600 hover:text-yellow-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? isYellowBlack
                      ? 'bg-yellow-400/20'
                      : isHighContrastDark
                      ? 'bg-slate-800'
                      : `${themeStyle.softBg}`
                    : 'bg-transparent'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight line-clamp-1">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full absolute -bottom-0.5"
                  style={{
                    backgroundColor: isYellowBlack
                      ? '#FACC15'
                      : isHighContrastDark
                      ? '#FFFFFF'
                      : themeStyle.primaryHex,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
