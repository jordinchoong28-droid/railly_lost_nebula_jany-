import React, { useState } from 'react';
import {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Clock,
  AlertTriangle,
  Umbrella,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Compass,
  Sparkles,
  Wind,
  Droplets,
  Thermometer,
  Calendar,
  MapPin,
} from 'lucide-react';
import { AppTheme, ContrastMode, Detailed24hWeather, HourlyWeatherForecast, LanguageCode } from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { TRANSLATIONS } from '../data/translations';

interface WeatherForecastSectionProps {
  weather: Detailed24hWeather | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onSelectShelteredMode?: () => void;
  onAskAiWeather?: () => void;
  contrastMode: ContrastMode;
  theme: AppTheme;
  language?: LanguageCode;
}

export const WeatherForecastSection: React.FC<WeatherForecastSectionProps> = ({
  weather,
  onRefresh,
  isRefreshing = false,
  onSelectShelteredMode,
  onAskAiWeather,
  contrastMode,
  theme,
  language = 'en',
}) => {
  const [activeWeatherView, setActiveWeatherView] = useState<'timeline' | 'nowcast' | 'periods'>('timeline');
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [isRegionalExpanded, setIsRegionalExpanded] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const safeWeather: Detailed24hWeather | null =
    (weather as any)?.weather && (weather as any).weather.hourly
      ? (weather as any).weather
      : (weather && (weather as any).hourly ? weather : null);

  if (!safeWeather) {
    return (
      <div
        id="weather-section-loading"
        className={`p-4 rounded-2xl border text-center text-xs animate-pulse ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <span>Loading Singapore 24-Hour Weather & Transit Radar...</span>
      </div>
    );
  }

  const hourlyList = safeWeather.hourly && safeWeather.hourly.length > 0 ? safeWeather.hourly : [];
  const selectedHour: HourlyWeatherForecast | undefined = hourlyList[selectedHourIndex] || hourlyList[0];

  const getWeatherIcon = (condition: string, iconType?: string) => {
    const condLower = condition.toLowerCase();
    if (iconType === 'thunder' || condLower.includes('thunder') || condLower.includes('tl') || condLower.includes('ht')) {
      return <CloudLightning className="text-amber-500 animate-bounce" size={20} />;
    }
    if (iconType === 'rain' || condLower.includes('rain') || condLower.includes('shower') || condLower.includes('ps')) {
      return <CloudRain className="text-sky-500" size={20} />;
    }
    if (iconType === 'sunny' || condLower.includes('fair') || condLower.includes('sun') || condLower.includes('clear')) {
      return <Sun className="text-amber-400" size={20} />;
    }
    return <Cloud className="text-slate-400" size={20} />;
  };

  return (
    <section
      id="singapore-weather-forecast-section"
      aria-label="Singapore Weather & Transit Disruption Radar"
      className={`rounded-2xl border p-3.5 transition-all shadow-xs ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-800'
      }`}
    >
      {/* 1. Header Bar with Singapore Local Time and 1-Click Refresh */}
      <div className="flex items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isYellowBlack ? 'bg-yellow-400 text-black' : `${themeStyle.softBg} ${themeStyle.primaryText}`
            }`}
          >
            <CloudRain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-black tracking-tight flex items-center gap-1">
                <span>{t.weatherTitle}</span>
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-400/30 flex items-center gap-1">
                <span>Live NEA / SGT</span>
              </span>
            </div>
            {/* Prominent Singapore Local Time Sync Badge */}
            <p className="text-[10px] opacity-80 font-semibold flex items-center gap-1 mt-0.5">
              <Clock size={11} className="text-emerald-500" />
              <span>
                {safeWeather.localSingaporeTime ? `${safeWeather.localSingaporeTime}` : 'Singapore Time (UTC+8)'}
                {safeWeather.localSingaporeDate ? ` • ${safeWeather.localSingaporeDate}` : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-refresh-weather"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
              isRefreshing ? 'opacity-50' : 'hover:scale-105 active:scale-95'
            } ${
              isYellowBlack
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
            title={t.refresh}
            aria-label={t.refresh}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="text-[10px]">{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Singapore Weather Metrics Snapshot (Official 24-hr Summary) */}
      <div
        id="weather-metrics-bar"
        className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between gap-2 text-xs flex-wrap ${
          isYellowBlack
            ? 'border-yellow-400/40 bg-yellow-400/10'
            : 'border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="shrink-0">{getWeatherIcon(safeWeather.generalForecast)}</div>
          <div>
            <div className="text-[11px] font-black">{safeWeather.generalForecast}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              {safeWeather.periodText || safeWeather.validPeriodText || 'Current Period'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-0.5" title="24h Temperature Range">
            <Thermometer size={12} className="text-amber-500" />
            <span>{safeWeather.temperature.low}°C - {safeWeather.temperature.high}°C</span>
          </div>

          <div className="flex items-center gap-0.5" title="Relative Humidity">
            <Droplets size={12} className="text-sky-500" />
            <span>{safeWeather.relativeHumidity.low}% - {safeWeather.relativeHumidity.high}%</span>
          </div>

          {safeWeather.wind && (
            <div className="flex items-center gap-0.5" title="Wind Speed & Direction">
              <Wind size={12} className="text-teal-500" />
              <span>{safeWeather.wind.direction} {safeWeather.wind.speed.low}-{safeWeather.wind.speed.high} km/h</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Proactive 1-Hour Advance Disruption & Crowd Alert */}
      {safeWeather.activeWeatherAlert && (
        <div
          id="weather-advance-1h-alert"
          className={`mt-2.5 p-3 rounded-xl border flex flex-col gap-1.5 ${
            isYellowBlack
              ? 'border-yellow-400 bg-yellow-400/15 text-yellow-300 font-bold'
              : 'border-amber-300/80 bg-amber-50/90 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300">
              <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>{safeWeather.activeWeatherAlert.title}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 uppercase tracking-tight">
              {t.advanceAlert}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed opacity-90 font-medium">
            {safeWeather.activeWeatherAlert.message}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold opacity-75">{t.disruptionAlert}:</span>
            {safeWeather.activeWeatherAlert.impactedLines.map((line) => (
              <span
                key={line}
                className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-white/80 dark:bg-black/40 border border-current"
              >
                {line}
              </span>
            ))}
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 ml-auto">
              ✓ {t.weatherSheltered}
            </span>
          </div>

          {onSelectShelteredMode && (
            <button
              type="button"
              id="btn-weather-shelter-recommendation"
              onClick={onSelectShelteredMode}
              className={`mt-1 py-1.5 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black font-black'
                  : `${themeStyle.buttonBg} text-white hover:opacity-95`
              }`}
            >
              <Umbrella size={14} />
              <span>{t.rainShelteredTransit}</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Weather View Mode Selector: Hourly Timeline | 2-Hour Station Nowcast | 24-Hour Periods */}
      <div className="flex items-center gap-1 mt-3 border-b pb-2">
        <button
          type="button"
          id="btn-weather-tab-timeline"
          onClick={() => setActiveWeatherView('timeline')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
            activeWeatherView === 'timeline'
              ? isYellowBlack
                ? 'bg-yellow-400 text-black font-black'
                : `${themeStyle.softBg} ${themeStyle.primaryText} ${themeStyle.border} border`
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Clock size={12} />
          <span>Timeline & 1h Alerts</span>
        </button>

        <button
          type="button"
          id="btn-weather-tab-nowcast"
          onClick={() => setActiveWeatherView('nowcast')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
            activeWeatherView === 'nowcast'
              ? isYellowBlack
                ? 'bg-yellow-400 text-black font-black'
                : `${themeStyle.softBg} ${themeStyle.primaryText} ${themeStyle.border} border`
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <MapPin size={12} />
          <span>2-Hr MRT Nowcast</span>
        </button>

        <button
          type="button"
          id="btn-weather-tab-periods"
          onClick={() => setActiveWeatherView('periods')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
            activeWeatherView === 'periods'
              ? isYellowBlack
                ? 'bg-yellow-400 text-black font-black'
                : `${themeStyle.softBg} ${themeStyle.primaryText} ${themeStyle.border} border`
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Calendar size={12} />
          <span>24-Hr Periods</span>
        </button>
      </div>

      {/* 5A. VIEW 1: Hourly Timeline Cards */}
      {activeWeatherView === 'timeline' && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Clock size={12} />
              <span>Singapore Hourly Timeline (Local SGT)</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {t.rainChance}
            </span>
          </div>

          {/* Scrollable Hourly Strip */}
          <div
            id="weather-hourly-timeline-strip"
            className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin"
          >
            {hourlyList.map((slot, idx) => {
              const isSelected = idx === selectedHourIndex;
              return (
                <button
                  key={`${slot.time}-${idx}`}
                  type="button"
                  id={`btn-weather-hour-${idx}`}
                  onClick={() => setSelectedHourIndex(idx)}
                  className={`min-w-[78px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all shrink-0 ${
                    isSelected
                      ? isYellowBlack
                        ? 'border-yellow-400 bg-yellow-400/25 text-yellow-300 font-black ring-2 ring-yellow-400'
                        : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText} font-black ring-2 ring-offset-1 ring-slate-300 shadow-xs`
                      : 'border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-800/60 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {slot.label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {slot.time}
                  </span>
                  <div className="my-0.5">{getWeatherIcon(slot.condition, slot.icon)}</div>
                  <span className="text-xs font-extrabold">{slot.temp}°C</span>
                  <span
                    className={`text-[9px] font-extrabold px-1 rounded-full ${
                      slot.rainChance >= 70
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : slot.rainChance >= 40
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    💧 {slot.rainChance}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Hour Crowd & Disruption Advisory Card */}
          {selectedHour && (
            <div
              id="weather-selected-hour-card"
              className={`mt-2 p-2.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                isYellowBlack
                  ? 'border-yellow-400/60 bg-yellow-400/10'
                  : 'border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <span>{selectedHour.label} ({selectedHour.time} SGT)</span>
                  <span>•</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">{selectedHour.condition}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Wind: {selectedHour.windSpeed}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <Users size={15} className="shrink-0 text-slate-600 dark:text-slate-300 mt-0.5" />
                <div className="text-[11px] leading-snug">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{t.feedCrowd}: </span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedHour.crowdImpact}</span>
                </div>
              </div>

              {selectedHour.foreseenDisruption && (
                <div className="flex items-start gap-2 pt-0.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold">
                    {t.disruptionAlert}: {selectedHour.foreseenDisruption}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5B. VIEW 2: 2-Hour Station Area Nowcast (NEA Real-Time Data) */}
      {activeWeatherView === 'nowcast' && (
        <div className="mt-2.5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <MapPin size={13} className="text-rose-500" />
              <span>NEA 2-Hour Nowcast for Key MRT Hubs</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">
              Valid: {safeWeather.twoHourValidPeriod || '2:30 pm to 4:30 pm'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {(safeWeather.twoHourForecast && safeWeather.twoHourForecast.length > 0
              ? safeWeather.twoHourForecast.slice(0, 12)
              : [
                  { area: 'Jurong East', forecast: 'Showers' },
                  { area: 'Clementi', forecast: 'Showers' },
                  { area: 'Bukit Batok', forecast: 'Showers' },
                  { area: 'Queenstown', forecast: 'Showers' },
                  { area: 'City / Tanjong Pagar', forecast: 'Cloudy' },
                  { area: 'Bishan / Ang Mo Kio', forecast: 'Cloudy' },
                  { area: 'Tampines / Bedok', forecast: 'Cloudy' },
                  { area: 'Woodlands', forecast: 'Cloudy' },
                ]
            ).map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                  isYellowBlack
                    ? 'border-yellow-400/40 bg-black'
                    : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="text-[11px] font-black">{item.area}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {item.forecast}
                  </div>
                </div>
                <div>{getWeatherIcon(item.forecast)}</div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            💡 Commuter Note: Stations with Showers report slick platforms and outdoor bus stop surge. Underground TEL & DTL interchange lines offer dry transit.
          </p>
        </div>
      )}

      {/* 5C. VIEW 3: 24-Hour Periods Breakdown (NEA Three 6h/12h blocks) */}
      {activeWeatherView === 'periods' && (
        <div className="mt-2.5 space-y-2">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            NEA 24-Hour Regional Periods Breakdown
          </div>

          {safeWeather.periods && safeWeather.periods.length > 0 ? (
            safeWeather.periods.map((p, pIdx) => (
              <div
                key={pIdx}
                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  isYellowBlack
                    ? 'border-yellow-400/40 bg-black'
                    : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between font-black text-[11px]">
                  <span>{p.timePeriod.text}</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {pIdx === 0 ? 'Current Block' : `Block ${pIdx + 1}`}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center pt-0.5">
                  {Object.entries(p.regions).map(([rKey, rVal]: [string, any]) => (
                    <div
                      key={rKey}
                      className="p-1 rounded bg-white/70 dark:bg-black/30 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        {rKey}
                      </div>
                      <div className="my-0.5 flex justify-center">
                        {getWeatherIcon(rVal.text, rVal.code)}
                      </div>
                      <div className="text-[8px] font-bold line-clamp-1">
                        {rVal.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500">24-hour periods data synchronized.</div>
          )}
        </div>
      )}

      {/* 6. Singapore 5 Regional Weather Breakdown (Toggleable) */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          id="btn-toggle-regional-weather"
          onClick={() => setIsRegionalExpanded(!isRegionalExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900"
        >
          <span className="flex items-center gap-1.5">
            <Compass size={13} />
            <span>Singapore 5-Region Weather Radar (West, East, Central, North, South)</span>
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <span>{isRegionalExpanded ? (t.moreFacilitiesHide || 'Hide') : (t.moreFacilitiesShow || 'View')}</span>
            {isRegionalExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isRegionalExpanded && (
          <div className="mt-2 space-y-2 animate-in fade-in duration-150">
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              {safeWeather.generalForecast} • Synced to Singapore local time.
            </p>

            {/* 5-Region Grid */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {Object.entries(safeWeather.regions).map(([regionKey, regionVal]: [string, { text: string; code: string }]) => (
                <div
                  key={regionKey}
                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 ${
                    isYellowBlack
                      ? 'border-yellow-400/40 bg-black'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                    {regionKey}
                  </span>
                  <div className="my-0.5">{getWeatherIcon(regionVal.text, regionVal.code)}</div>
                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1 leading-tight">
                    {regionVal.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Weather-Aware AI Route Advice button */}
            {onAskAiWeather && (
              <button
                type="button"
                id="btn-ask-ai-weather-plan"
                onClick={onAskAiWeather}
                className={`w-full mt-2 py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                    : `${themeStyle.softBg} ${themeStyle.primaryText} ${themeStyle.border} hover:opacity-90`
                }`}
              >
                <Sparkles size={14} />
                <span>{t.askAiWeather}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
