/**
 * Singapore Local Time (SGT / UTC+8 / Asia/Singapore) Utilities
 * Synchronizes all rail disruptions, weather radar, lift statuses, and route planning
 * strictly to Singapore local time.
 */

export const SG_TIMEZONE = 'Asia/Singapore';

/**
 * Returns a Date object representing the current instant.
 */
export function getSingaporeNow(): Date {
  return new Date();
}

/**
 * Returns current Singapore hour (0 - 23) in SGT.
 */
export function getSingaporeHour(date: Date | number = new Date()): number {
  const d = typeof date === 'number' ? new Date(date) : date;
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: SG_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(d);
  return parseInt(hourStr, 10);
}

/**
 * Formats time in 24-hour HH:mm Singapore time (e.g. "15:05").
 */
export function formatSingaporeTime(
  date: Date | number = new Date(),
  includeSeconds = false
): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-SG', {
    timeZone: SG_TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
  });
}

/**
 * Formats time in 12-hour h:mm a Singapore time (e.g. "3:05 PM").
 */
export function formatSingaporeTime12h(date: Date | number = new Date()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-SG', {
    timeZone: SG_TIMEZONE,
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Formats date in Singapore format (e.g. "19 Sep 2026" or custom options).
 */
export function formatSingaporeDate(
  date: Date | number = new Date(),
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-SG', {
    timeZone: SG_TIMEZONE,
    ...options,
  });
}

/**
 * Formats full human-readable Singapore date & time string:
 * e.g. "15:05 SGT • Sat, 19 Sep 2026"
 */
export function formatSingaporeFullStatus(date: Date | number = new Date()): string {
  const time = formatSingaporeTime(date);
  const dateStr = formatSingaporeDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return `${time} SGT • ${dateStr}`;
}

// Convenient short aliases matching server and client helpers
export const getSgTimeString = (options?: { second?: '2-digit' }) =>
  formatSingaporeTime(new Date(), options?.second === '2-digit');
export const getSgHour = () => getSingaporeHour();
export const getSgDateString = () => formatSingaporeDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
export const getSgFullDateString = () => formatSingaporeDate(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

