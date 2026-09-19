import { StationData, LanguageCode } from '../types';

export function getStationDisplayName(st?: StationData | null, lang: LanguageCode = 'en'): string {
  if (!st) return '';
  if (lang === 'zh' && st.nameZh) return `${st.name} (${st.nameZh})`;
  if (lang === 'ms' && st.nameMs) return st.nameMs;
  if (lang === 'ta' && st.nameTa) return `${st.name} (${st.nameTa})`;
  if (lang === 'my' && st.nameMy) return `${st.name} (${st.nameMy})`;
  return st.name;
}
