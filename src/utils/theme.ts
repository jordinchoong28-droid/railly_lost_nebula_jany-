import { AppTheme } from '../types';

export interface ThemeStyles {
  id: AppTheme;
  label: string;
  dotColor: string;
  primaryHex: string;
  primaryBg: string;
  primaryBgHover: string;
  primaryText: string;
  primaryBorder: string;
  activeBorder: string;
  activeBgLight: string;
  activeBadge: string;
  ring: string;
  headerBrandAccent: string;
  cardGlow: string;
  accentGradient: string;
}

export const THEME_CONFIG: Record<AppTheme, ThemeStyles> = {
  pink: {
    id: 'pink',
    label: 'Sakura Pink',
    dotColor: '#F43F5E',
    primaryHex: '#E11D48',
    primaryBg: 'bg-rose-600',
    primaryBgHover: 'hover:bg-rose-700',
    primaryText: 'text-rose-600 dark:text-rose-400',
    primaryBorder: 'border-rose-300 dark:border-rose-700',
    activeBorder: 'border-rose-500',
    activeBgLight: 'bg-rose-50 dark:bg-rose-950/40',
    activeBadge: 'bg-rose-600 text-white',
    ring: 'focus:ring-rose-500 ring-rose-500',
    headerBrandAccent: 'text-rose-600 dark:text-rose-400',
    cardGlow: 'shadow-rose-100 dark:shadow-none',
    accentGradient: 'from-rose-500 via-pink-500 to-rose-600',
  },
  yellow: {
    id: 'yellow',
    label: 'Sunflower Yellow',
    dotColor: '#EAB308',
    primaryHex: '#CA8A04',
    primaryBg: 'bg-amber-500',
    primaryBgHover: 'hover:bg-amber-600',
    primaryText: 'text-amber-700 dark:text-amber-400',
    primaryBorder: 'border-amber-300 dark:border-amber-700',
    activeBorder: 'border-amber-500',
    activeBgLight: 'bg-amber-50 dark:bg-amber-950/40',
    activeBadge: 'bg-amber-500 text-slate-950 font-bold',
    ring: 'focus:ring-amber-500 ring-amber-500',
    headerBrandAccent: 'text-amber-600 dark:text-amber-400',
    cardGlow: 'shadow-amber-100 dark:shadow-none',
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-600',
  },
  green: {
    id: 'green',
    label: 'Emerald Green',
    dotColor: '#10B981',
    primaryHex: '#059669',
    primaryBg: 'bg-emerald-600',
    primaryBgHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-700 dark:text-emerald-400',
    primaryBorder: 'border-emerald-300 dark:border-emerald-700',
    activeBorder: 'border-emerald-500',
    activeBgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    activeBadge: 'bg-emerald-600 text-white',
    ring: 'focus:ring-emerald-500 ring-emerald-500',
    headerBrandAccent: 'text-emerald-600 dark:text-emerald-400',
    cardGlow: 'shadow-emerald-100 dark:shadow-none',
    accentGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
  },
  blue: {
    id: 'blue',
    label: 'Ocean Blue',
    dotColor: '#3B82F6',
    primaryHex: '#2563EB',
    primaryBg: 'bg-blue-600',
    primaryBgHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-700 dark:text-blue-400',
    primaryBorder: 'border-blue-300 dark:border-blue-700',
    activeBorder: 'border-blue-500',
    activeBgLight: 'bg-blue-50 dark:bg-blue-950/40',
    activeBadge: 'bg-blue-600 text-white',
    ring: 'focus:ring-blue-500 ring-blue-500',
    headerBrandAccent: 'text-blue-600 dark:text-blue-400',
    cardGlow: 'shadow-blue-100 dark:shadow-none',
    accentGradient: 'from-blue-500 via-indigo-500 to-blue-600',
  },
};
