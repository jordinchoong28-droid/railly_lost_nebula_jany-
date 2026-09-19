import React from 'react';
import { Zap, HeartHandshake, Accessibility, ShieldCheck, Compass } from 'lucide-react';
import { AppTheme, ContrastMode, LanguageCode, PersonaType, TransportMode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { THEME_CONFIG } from '../utils/theme';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  theme?: AppTheme;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
  language,
  contrastMode,
  theme = 'pink',
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;

  const modes = [
    {
      id: 'fastest-density' as TransportMode,
      legacyIds: ['marcus', 'fastest-density'],
      name: t.fastestModeLabel || 'Fastest',
      icon: Zap,
      accent: '#2563EB',
      badge: t.fastestBadge,
      quote: t.fastestModeDesc || t.marcusDesc || 'Live carriage 1-6 crowd load & quick transfers'
    },
    {
      id: 'low-sensory' as TransportMode,
      legacyIds: ['priya', 'low-sensory'],
      name: t.sensoryModeLabel || 'Low-Sensory',
      icon: HeartHandshake,
      accent: '#9333EA',
      badge: t.lowSensoryBadge,
      quote: t.sensoryModeDesc || t.priyaDesc || 'Quiet stations, low decibels & calm exits'
    },
    {
      id: 'step-free' as TransportMode,
      legacyIds: ['mobility', 'step-free'],
      name: t.mobilityLabel || 'Step-Free',
      icon: Accessibility,
      accent: '#059669',
      badge: t.stepFreeBadge,
      quote: t.mobilityDesc || '100% elevators, ramp exits & level doors'
    },
    {
      id: 'standard' as TransportMode,
      legacyIds: ['general', 'standard'],
      name: t.generalLabel || 'Standard',
      icon: ShieldCheck,
      accent: themeStyle.primaryHex,
      badge: t.standardBadge,
      quote: t.generalDesc || 'Fastest direct Singapore MRT/LRT paths'
    }
  ];

  return (
    <section
      id="persona-selector"
      aria-label="Commuter Travel Modes"
      className={`rounded-2xl p-3 sm:p-3.5 border transition-all ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Compass size={15} className={isYellowBlack ? 'text-yellow-400' : themeStyle.primaryText} />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            {t.modes || 'Travel Mode'}
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          {t.autoTunesRoute}
        </span>
      </div>

      {/* 2x2 Grid optimized for mobile thumbs */}
      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected =
            selectedPersona === m.id || m.legacyIds.includes(selectedPersona as string);

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectPersona(m.id)}
              className={`text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between tap-bounce ${
                isSelected
                  ? isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-1.5 ring-yellow-400'
                    : isHighContrastDark
                    ? 'border-amber-400 bg-slate-800 text-white shadow-xs ring-1 ring-amber-400'
                    : `${themeStyle.activeBorder} ${themeStyle.activeBgLight} text-slate-900 shadow-xs ring-1.5 ${themeStyle.border}`
                  : isYellowBlack
                  ? 'border-yellow-400/30 bg-black text-yellow-400/80 hover:border-yellow-400'
                  : isHighContrastDark
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isYellowBlack
                      ? '#FACC1520'
                      : isSelected
                      ? `${m.accent}20`
                      : '#F1F5F9',
                  }}
                >
                  <Icon
                    size={14}
                    style={{ color: isYellowBlack ? '#FACC15' : m.accent }}
                  />
                </div>
                {isSelected && (
                  <span
                    className={`text-[9px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      isYellowBlack
                        ? 'bg-yellow-400 text-black'
                        : themeStyle.activeBadge
                    }`}
                  >
                    {t.activeBadge}
                  </span>
                )}
              </div>

              <div className="min-w-0 w-full mt-1">
                <div className="font-bold text-xs leading-snug break-words">{m.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 break-words">
                  {m.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
