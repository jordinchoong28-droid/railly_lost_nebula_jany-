import React, { useState, useMemo } from 'react';
import { X, WifiOff, MapPin, ZoomIn, ZoomOut, Check, ArrowRight, ShieldCheck, Search, Filter, RotateCcw, Globe, Compass } from 'lucide-react';
import { ALL_STATIONS, MRT_EDGES } from '../data/mrtData';
import { ContrastMode, LanguageCode, MRTLineCode, StationData } from '../types';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { LeafletSingaporeMap } from './LeafletSingaporeMap';

interface OfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromStationId: string;
  toStationId: string;
  onSelectFrom: (id: string) => void;
  onSelectTo: (id: string) => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  routeStationIds?: string[];
}

export const OfflineMapModal: React.FC<OfflineMapModalProps> = ({
  isOpen,
  onClose,
  fromStationId,
  toStationId,
  onSelectFrom,
  onSelectTo,
  language,
  contrastMode,
  routeStationIds = [],
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const [selectedStation, setSelectedStation] = useState<StationData | null>(
    ALL_STATIONS[fromStationId] || ALL_STATIONS['city-hall'] || null
  );
  const [zoom, setZoom] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLineFilter, setSelectedLineFilter] = useState<MRTLineCode | 'ALL'>('ALL');
  const [viewType, setViewType] = useState<'schematic' | 'gis'>('schematic');

  const stations = Object.values(ALL_STATIONS);

  // Search filter
  const filteredStationList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.codes.some((c) => c.toLowerCase().includes(q)) ||
        s.nameZh.includes(q) ||
        s.nameMs.toLowerCase().includes(q)
    );
  }, [searchQuery, stations]);

  const haloColor = isYellowBlack ? '#000000' : isHighContrastDark ? '#020617' : '#FFFFFF';
  const labelColor = isYellowBlack ? '#FACC15' : isHighContrastDark ? '#F8FAFC' : '#0F172A';

  return (
    <div
      id="offline-map-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Offline MRT Network Underground Map"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`w-full max-w-6xl h-[94vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-950 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <WifiOff size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  {t.transitMapTitle}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white shadow-xs">
                  {t.offlineMode}
                </span>
              </div>
              <p className={`text-xs ${isYellowBlack ? 'text-yellow-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher: Schematic vs Geospatial GIS */}
            <div className="flex items-center p-0.5 rounded-xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewType('schematic')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewType === 'schematic'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>{t.schematicView}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType('gis')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'gis'
                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe size={13} />
                <span>{t.streetGisView}</span>
                <span className="text-[9px] px-1 bg-emerald-700 text-emerald-100 rounded">GPS</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={t.destPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs font-semibold outline-none w-36 sm:w-52 transition-all ${
                  isYellowBlack
                    ? 'bg-black border-yellow-400 text-yellow-400 placeholder:text-yellow-600 focus:ring-1 focus:ring-yellow-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/30'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Zoom Controls (Active in Schematic Mode) */}
            {viewType === 'schematic' && (
              <div className="flex items-center border rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.7))}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                  title="Zoom out"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold border-x border-slate-200 dark:border-slate-700"
                  title="Reset zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 2.2))}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                  title="Zoom in"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border text-xs font-bold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
              title="Close offline map"
              aria-label="Close offline map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Line Quick-Filter Bar */}
        <div className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs font-semibold ${
          isYellowBlack ? 'bg-black border-yellow-400/40' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => setSelectedLineFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedLineFilter === 'ALL'
                ? isYellowBlack
                  ? 'bg-yellow-400 text-black'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {t.allLines}
          </button>
          {(Object.keys(MRT_LINE_META) as MRTLineCode[]).map((lineCode) => {
            const meta = MRT_LINE_META[lineCode];
            const isSelected = selectedLineFilter === lineCode;
            return (
              <button
                key={lineCode}
                type="button"
                onClick={() => setSelectedLineFilter(lineCode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-xs ring-2 ring-offset-1 ring-slate-400'
                    : 'opacity-70 hover:opacity-100 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                style={{ backgroundColor: isSelected ? meta.color : undefined }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{meta.shortLabel || lineCode}</span>
                <span className="hidden md:inline font-normal text-[10px]">({meta.name})</span>
              </button>
            );
          })}
        </div>

        {/* Search Results Dropdown Preview */}
        {filteredStationList.length > 0 && searchQuery.trim() && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300">Matching Stations ({filteredStationList.length}):</span>
            {filteredStationList.slice(0, 6).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setSelectedStation(st);
                  setSearchQuery('');
                }}
                className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 font-bold hover:bg-amber-100 text-slate-800 dark:text-slate-100 flex items-center gap-1.5"
              >
                <span className="text-[10px] text-slate-500 font-mono">{st.codes[0]}</span>
                <span>{st.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Map Canvas and Selected Station Drawer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {viewType === 'gis' ? (
            <div className="flex-1 w-full h-full relative p-2 bg-slate-100/70 dark:bg-slate-950/80">
              <LeafletSingaporeMap
                selectedStation={selectedStation}
                onSelectStation={(st) => setSelectedStation(st)}
                fromStationId={fromStationId}
                toStationId={toStationId}
                routeStationIds={routeStationIds}
                contrastMode={contrastMode}
                selectedLineFilter={selectedLineFilter}
              />
            </div>
          ) : (
            /* SVG Map Canvas */
            <div className="flex-1 overflow-auto bg-slate-100/70 dark:bg-slate-950/80 p-4 relative flex items-center justify-center select-none">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-[760px] aspect-[4/3] relative"
            >
              <svg
                viewBox="0 0 740 560"
                className="w-full h-full drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern
                    id="grid-pattern"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.2" fill="currentColor" opacity="0.08" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                {/* Edges / Lines */}
                {MRT_EDGES.map((edge) => {
                  const s1 = ALL_STATIONS[edge.a];
                  const s2 = ALL_STATIONS[edge.b];
                  if (!s1 || !s2) return null;

                  const isRouteEdge =
                    routeStationIds.includes(edge.a) && routeStationIds.includes(edge.b);
                  const meta = MRT_LINE_META[edge.line];
                  const isFilteredLine =
                    selectedLineFilter === 'ALL' || selectedLineFilter === edge.line;

                  const opacity = !isFilteredLine ? 0.15 : isRouteEdge ? 1 : 0.85;

                  return (
                    <g key={edge.key}>
                      {/* Active route highlight glow */}
                      {isRouteEdge && (
                        <line
                          x1={s1.x}
                          y1={s1.y}
                          x2={s2.x}
                          y2={s2.y}
                          stroke="#E11D48"
                          strokeWidth="11"
                          strokeLinecap="round"
                          opacity="0.4"
                        />
                      )}
                      {/* Base Track Line */}
                      <line
                        x1={s1.x}
                        y1={s1.y}
                        x2={s2.x}
                        y2={s2.y}
                        stroke={meta.color}
                        strokeWidth={isRouteEdge ? '6' : isFilteredLine ? '4.5' : '3'}
                        strokeLinecap="round"
                        opacity={opacity}
                      />
                    </g>
                  );
                })}

                {/* Station Nodes & High-Clarity Names */}
                {stations.map((st) => {
                  const isSelected = selectedStation?.id === st.id;
                  const isOrigin = fromStationId === st.id;
                  const isDest = toStationId === st.id;
                  const isPartOfRoute = routeStationIds.includes(st.id);
                  const isInterchange = st.codes.length > 1;
                  const isMatchesSearch =
                    searchQuery.trim().length > 0 &&
                    (st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      st.codes.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));

                  const isFilteredLine =
                    selectedLineFilter === 'ALL' ||
                    st.lines.some((l) => l === selectedLineFilter);

                  const stationOpacity = !isFilteredLine ? 0.2 : 1;

                  // Label position offset
                  const labelYOffset = st.y > 470 ? -12 : 15;

                  return (
                    <g
                      key={st.id}
                      className="cursor-pointer group"
                      opacity={stationOpacity}
                      onClick={() => setSelectedStation(st)}
                    >
                      {/* Outer animated halo for Origin, Dest, or Search Match */}
                      {(isOrigin || isDest || isMatchesSearch) && (
                        <circle
                          cx={st.x}
                          cy={st.y}
                          r="16"
                          fill="none"
                          stroke={isOrigin ? '#10B981' : isDest ? '#E11D48' : '#F59E0B'}
                          strokeWidth="3"
                          className="animate-pulse"
                          opacity="0.8"
                        />
                      )}

                      {/* Station Outer Hub Capsule for Interchange */}
                      {isInterchange && (
                        <circle
                          cx={st.x}
                          cy={st.y}
                          r="9"
                          fill="#FFFFFF"
                          stroke="#0F172A"
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={st.x}
                        cy={st.y}
                        r={isInterchange ? '6' : '5'}
                        fill={
                          isSelected
                            ? '#FACC15'
                            : isOrigin
                            ? '#10B981'
                            : isDest
                            ? '#E11D48'
                            : isInterchange
                            ? '#FFFFFF'
                            : st.lines.length > 0
                            ? MRT_LINE_META[st.lines[0]].color
                            : '#0F172A'
                        }
                        stroke={
                          isSelected
                            ? '#B45309'
                            : isOrigin
                            ? '#065F46'
                            : isDest
                            ? '#9F1239'
                            : '#FFFFFF'
                        }
                        strokeWidth="1.8"
                      />

                      {/* Station Code Badge for key interchange or route stations */}
                      {(isInterchange || isPartOfRoute || isSelected) && (
                        <g transform={`translate(${st.x}, ${st.y + (st.y > 470 ? -24 : 26)})`}>
                          <rect
                            x="-16"
                            y="-6"
                            width="32"
                            height="11"
                            rx="3"
                            fill={haloColor}
                            stroke={isYellowBlack ? '#FACC15' : '#94A3B8'}
                            strokeWidth="0.8"
                            opacity="0.95"
                          />
                          <text
                            x="0"
                            y="2.5"
                            textAnchor="middle"
                            fontSize="7.5"
                            fontWeight="800"
                            fill={isYellowBlack ? '#FACC15' : '#475569'}
                            fontFamily="monospace"
                            className="pointer-events-none select-none"
                          >
                            {st.codes[0]}
                          </text>
                        </g>
                      )}

                      {/* Crisp Station Name Halo Layer (ensures 100% legibility on any track) */}
                      <text
                        x={st.x}
                        y={st.y + labelYOffset}
                        textAnchor="middle"
                        fontSize={isInterchange || isPartOfRoute || isSelected ? '11' : '9.5'}
                        fontWeight={isInterchange || isPartOfRoute || isSelected ? '800' : '700'}
                        stroke={haloColor}
                        strokeWidth="4"
                        strokeLinejoin="round"
                        fill="none"
                        className="pointer-events-none select-none"
                      >
                        {st.name}
                      </text>

                      {/* Crisp Station Name Fill Layer */}
                      <text
                        x={st.x}
                        y={st.y + labelYOffset}
                        textAnchor="middle"
                        fontSize={isInterchange || isPartOfRoute || isSelected ? '11' : '9.5'}
                        fontWeight={isInterchange || isPartOfRoute || isSelected ? '800' : '700'}
                        fill={
                          isSelected
                            ? isYellowBlack
                              ? '#FACC15'
                              : '#B45309'
                            : isPartOfRoute
                            ? '#BE123C'
                            : labelColor
                        }
                        className="pointer-events-none select-none"
                      >
                        {st.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          )}

          {/* Station Details Side Panel */}
          {selectedStation && (
            <div
              className={`w-full md:w-80 border-t md:border-t-0 md:border-l p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-y-auto ${
                isYellowBlack
                  ? 'bg-black border-yellow-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedStation.codes.join(' / ')}
                  </span>
                  <div className="flex gap-1">
                    {selectedStation.lines.map((l) => (
                      <span
                        key={l}
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: MRT_LINE_META[l].color }}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {selectedStation.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {selectedStation.groundLevel === 'UNDERGROUND' ? 'Underground' : 'Elevated'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {selectedStation.nameZh} &bull; {selectedStation.nameMs} &bull;{' '}
                  {selectedStation.nameTa} &bull; {selectedStation.nameMy}
                </p>

                {/* GPS Coordinates & Live Crowding */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Platform Crowd</span>
                    <span className={`font-bold flex items-center gap-1.5 ${
                      selectedStation.currentCrowd === 'h'
                        ? 'text-rose-600 dark:text-rose-400'
                        : selectedStation.currentCrowd === 'l'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {selectedStation.currentCrowd === 'h' ? 'Level H (Heavy)' : selectedStation.currentCrowd === 'l' ? 'Level L (Quiet)' : 'Level M (Moderate)'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">30-Min Forecast</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedStation.forecastCrowd30m === 'l' ? 'Dropping to Low' : selectedStation.forecastCrowd30m === 'h' ? 'Rising to Peak' : 'Stable Moderate'}
                    </span>
                  </div>
                </div>

                {/* Accessibility Stats */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold">{t.stepFreeLiftsTitle}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedStation.accessibility.liftAccessible
                        ? t.liftVerified
                        : t.escalatorRequired}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold">{t.ambientVolume}:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedStation.accessibility.averageDecibels} dB
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold block mb-1">
                      {t.quietExitsTitle}:
                    </span>
                    <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      {selectedStation.accessibility.quietExits.join(', ')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold block mb-1">
                      {t.boardCarriage}:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      Doors {selectedStation.accessibility.wheelchairBoardingDoors.join(', ')} ({t.liftReady})
                    </span>
                  </div>
                  {selectedStation.lat && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 font-mono text-[10px] text-slate-500">
                      GPS: {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E
                    </div>
                  )}
                </div>
              </div>

              {/* Set as Departure / Arrival Route Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onSelectFrom(selectedStation.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    fromStationId === selectedStation.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {fromStationId === selectedStation.id ? `✓ ${t.setStart}` : t.setStart}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTo(selectedStation.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    toStationId === selectedStation.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {toStationId === selectedStation.id ? `✓ ${t.setEnd}` : t.setEnd}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
