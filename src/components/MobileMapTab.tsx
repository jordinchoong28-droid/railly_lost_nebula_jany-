import React, { useState, useMemo } from 'react';
import {
  Map,
  Layers,
  MapPin,
  Check,
  ArrowRight,
  ShieldCheck,
  Accessibility,
  Volume2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  Maximize2,
  Minimize2,
  Compass,
  Globe,
  Sparkles,
  Eye,
} from 'lucide-react';
import { ALL_STATIONS, MRT_EDGES } from '../data/mrtData';
import { AppTheme, ContrastMode, LanguageCode, MRTLineCode, StationData } from '../types';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { LeafletSingaporeMap } from './LeafletSingaporeMap';
import { THEME_CONFIG } from '../utils/theme';
import { VoiceService } from '../utils/speech';

interface MobileMapTabProps {
  fromStationId: string;
  toStationId: string;
  onSelectFrom: (id: string) => void;
  onSelectTo: (id: string) => void;
  language: LanguageCode;
  contrastMode: ContrastMode;
  routeStationIds?: string[];
  theme?: AppTheme;
  onNavigateToRoute: () => void;
}

type LabelDensityMode = 'smart' | 'all' | 'clean';

export const MobileMapTab: React.FC<MobileMapTabProps> = ({
  fromStationId,
  toStationId,
  onSelectFrom,
  onSelectTo,
  language,
  contrastMode,
  routeStationIds = [],
  theme = 'pink',
  onNavigateToRoute,
}) => {
  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const [mapMode, setMapMode] = useState<'schematic' | 'gis'>('schematic');
  const [selectedStation, setSelectedStation] = useState<StationData>(
    ALL_STATIONS[fromStationId] || ALL_STATIONS['city-hall']
  );
  const [selectedLineFilter, setSelectedLineFilter] = useState<MRTLineCode | 'ALL'>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpandedHeight, setIsExpandedHeight] = useState(false);
  const [labelDensity, setLabelDensity] = useState<LabelDensityMode>('smart');
  const [hoveredStation, setHoveredStation] = useState<StationData | null>(null);

  const stations = Object.values(ALL_STATIONS);

  // Filtered station search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stations
      .filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.codes.some((c) => c.toLowerCase().includes(q)) ||
          st.nameZh?.includes(q) ||
          st.nameMs?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, stations]);

  const getStationDisplayName = (st: StationData) => {
    if (language === 'zh' && st.nameZh) return st.nameZh;
    if (language === 'ms' && st.nameMs) return st.nameMs;
    if (language === 'ta' && st.nameTa) return st.nameTa;
    if (language === 'my' && st.nameMy) return st.nameMy;
    return st.name;
  };

  const handleSpeak = (st: StationData) => {
    const speech = VoiceService.formatStationAnnouncement(
      st,
      st.lines.map((l) => MRT_LINE_META[l]?.name || l).join(', '),
      language
    );
    VoiceService.speak(speech, language);
  };

  const handleSelectSearchResult = (st: StationData) => {
    setSelectedStation(st);
    setSearchQuery('');
  };

  const haloColor = isYellowBlack ? '#000000' : isHighContrastDark ? '#020617' : '#FFFFFF';
  const labelColor = isYellowBlack ? '#FACC15' : isHighContrastDark ? '#F8FAFC' : '#0F172A';

  // Major terminal or transit hubs that are critical anchors on the MRT map
  const isMajorHub = (st: StationData) => {
    if (st.codes.length > 1) return true;
    const terminals = [
      'jurong-east',
      'pasir-ris',
      'changi-airport',
      'marina-south-pier',
      'woodlands',
      'punggol',
      'harbourfront',
      'tuas-link',
      'bukit-panjang',
      'ang-mo-kio',
      'tampines',
      'boon-lay',
    ];
    return terminals.includes(st.id);
  };

  // Compute smart label offset to prevent vertical/horizontal overlap
  const getLabelPosition = (st: StationData, index: number) => {
    if (st.y > 480) {
      return { xOffset: 0, yOffset: -14, anchor: 'middle' as const };
    }
    if (st.y < 120) {
      return { xOffset: 0, yOffset: 16, anchor: 'middle' as const };
    }
    if (st.x < 130) {
      return { xOffset: 10, yOffset: 4, anchor: 'start' as const };
    }
    if (st.x > 630) {
      return { xOffset: -10, yOffset: 4, anchor: 'end' as const };
    }

    // Alternate above / below to stop adjacent same-line collisions
    const cellHash = Math.floor(st.x / 35) + Math.floor(st.y / 35);
    const isAbove = cellHash % 2 === 1;
    return {
      xOffset: 0,
      yOffset: isAbove ? -13 : 15,
      anchor: 'middle' as const,
    };
  };

  return (
    <div className="space-y-3">
      {/* Map Control Bar & Filters */}
      <div
        className={`p-3 rounded-2xl border transition-all ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isYellowBlack ? 'bg-yellow-400/20 text-yellow-400' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Map size={16} />
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider">
                {t.transitMapTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Schematic Network & Street GIS with Clear Station Visibility
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            {/* Toggle Map Mode: Schematic vs Street GIS */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMapMode('schematic')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mapMode === 'schematic'
                    ? isYellowBlack
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : `${themeStyle.primaryBg} text-white shadow-xs`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass size={12} />
                <span>{t.schematicView}</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('gis')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mapMode === 'gis'
                    ? isYellowBlack
                      ? 'bg-yellow-400 text-black shadow-xs'
                      : `${themeStyle.primaryBg} text-white shadow-xs`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe size={12} />
                <span>{t.streetGisView}</span>
              </button>
            </div>

            {/* Schematic Label Density Toggle (Smart / All / Clean) */}
            {mapMode === 'schematic' && (
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLabelDensity('smart')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    labelDensity === 'smart'
                      ? isYellowBlack
                        ? 'bg-yellow-400 text-black'
                        : 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="Smart Declutter: Shows hubs, routes & zoom reveals"
                >
                  {t.smartNames}
                </button>
                <button
                  type="button"
                  onClick={() => setLabelDensity('all')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    labelDensity === 'all'
                      ? isYellowBlack
                        ? 'bg-yellow-400 text-black'
                        : 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  title="Show all station names"
                >
                  {t.allNames}
                </button>
              </div>
            )}

            {/* Toggle Expand Viewport */}
            <button
              type="button"
              onClick={() => setIsExpandedHeight(!isExpandedHeight)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isExpandedHeight ? 'Collapse map' : 'Expand map size'}
              aria-label={isExpandedHeight ? 'Collapse map' : 'Expand map size'}
            >
              {isExpandedHeight ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Station Search Input */}
        <div className="relative mb-2">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.changeStationPlaceholder}
            className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border font-medium outline-none transition-all ${
              isYellowBlack
                ? 'bg-black border-yellow-400 text-yellow-300 placeholder:text-yellow-600'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-rose-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(st)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {st.codes.join(' / ')}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{st.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {st.nameZh} &bull; {st.nameMs}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {st.lines.map((l) => (
                      <span
                        key={l}
                        className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white"
                        style={{ backgroundColor: MRT_LINE_META[l]?.color }}
                      >
                        {MRT_LINE_META[l]?.shortLabel || l}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Line Filter Chips: All, MRT Lines, and LRT Lines */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedLineFilter('ALL')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap shrink-0 ${
              selectedLineFilter === 'ALL'
                ? isYellowBlack
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {t.allLines}
          </button>
          {Object.entries(MRT_LINE_META).map(([code, meta]) => {
            const isSelected = selectedLineFilter === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedLineFilter(code as MRTLineCode)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'text-white ring-2 ring-offset-1 ring-slate-400 shadow-xs'
                    : 'text-white opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: meta.color }}
              >
                <span>{meta.shortLabel || code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Display Viewport */}
      <div
        className={`rounded-2xl border overflow-hidden relative shadow-2xs transition-all duration-200 ${
          isYellowBlack
            ? 'bg-black border-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-950 border-slate-800'
            : 'bg-slate-900 border-slate-200'
        } ${isExpandedHeight ? 'h-[580px]' : 'h-[430px] sm:h-[480px]'}`}
      >
        {mapMode === 'gis' ? (
          <LeafletSingaporeMap
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            fromStationId={fromStationId}
            toStationId={toStationId}
            routeStationIds={routeStationIds}
            contrastMode={contrastMode}
            selectedLineFilter={selectedLineFilter}
            onSelectFrom={onSelectFrom}
            onSelectTo={onSelectTo}
          />
        ) : (
          /* High-Contrast SVG Schematic Network Map with Zoom & Pan */
          <div className="w-full h-full overflow-auto relative p-2 flex items-center justify-center select-none">
            {/* Interactive Zoom Controls & Reset */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-md">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 2.5))}
                className="w-8 h-8 rounded-xl bg-slate-800/90 text-white border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
                title="Zoom In"
                aria-label="Zoom in on schematic map"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.75))}
                className="w-8 h-8 rounded-xl bg-slate-800/90 text-white border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
                title="Zoom Out"
                aria-label="Zoom out of schematic map"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="w-8 h-8 rounded-xl bg-slate-800/90 text-white border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors text-[10px] font-bold"
                title="Reset Zoom (100%)"
                aria-label="Reset zoom level"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Quick Map Hints Pill */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700 px-2.5 py-1 rounded-full text-[10px] text-slate-300 font-medium">
              <span>Tap any station for details & directions</span>
              {selectedLineFilter !== 'ALL' && (
                <span className="text-amber-400 font-bold">&bull; Showing {selectedLineFilter}</span>
              )}
            </div>

            {/* Scale-controlled SVG Canvas with full Singapore coverage */}
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <svg
                viewBox="0 0 740 560"
                className="w-full h-full min-w-[620px] min-h-[420px] select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Subtle Grid Pattern for spatial orientation */}
                  <pattern
                    id="schematic-grid"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
                  </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#schematic-grid)" opacity="0.4" />

                {/* Network Edges (Tracks) */}
                {MRT_EDGES.map((edge, idx) => {
                  const s1 = ALL_STATIONS[edge.a];
                  const s2 = ALL_STATIONS[edge.b];
                  if (!s1 || !s2) return null;

                  const isLineActive =
                    selectedLineFilter === 'ALL' || edge.line === selectedLineFilter;
                  const isRouteEdge =
                    routeStationIds.length > 1 &&
                    routeStationIds.includes(edge.a) &&
                    routeStationIds.includes(edge.b);
                  const color = MRT_LINE_META[edge.line]?.color || '#888';

                  return (
                    <g key={`edge-${edge.line}-${edge.a}-${edge.b}-${idx}`}>
                      {/* Active Route Highlight Aura */}
                      {isRouteEdge && (
                        <line
                          x1={s1.x}
                          y1={s1.y}
                          x2={s2.x}
                          y2={s2.y}
                          stroke="#E11D48"
                          strokeWidth="11"
                          strokeLinecap="round"
                          opacity="0.5"
                        />
                      )}

                      {/* Main track line */}
                      <line
                        x1={s1.x}
                        y1={s1.y}
                        x2={s2.x}
                        y2={s2.y}
                        stroke={isYellowBlack ? '#FACC15' : color}
                        strokeWidth={isRouteEdge ? 6 : isLineActive ? 4.5 : 2}
                        strokeOpacity={isLineActive ? (isRouteEdge ? 1 : 0.85) : 0.15}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {/* Station Nodes & Legible Labels */}
                {stations.map((st, idx) => {
                  const isFrom = st.id === fromStationId;
                  const isTo = st.id === toStationId;
                  const isSelected = selectedStation?.id === st.id;
                  const isHovered = hoveredStation?.id === st.id;
                  const isRoute = routeStationIds.includes(st.id);
                  const isInterchange = st.codes.length > 1;
                  const isHub = isMajorHub(st);
                  const isLineActive =
                    selectedLineFilter === 'ALL' ||
                    st.lines.some((l) => l === selectedLineFilter);

                  const stationOpacity = !isLineActive ? 0.2 : 1;

                  // Intelligent label visibility logic to PREVENT squeezing / overlap:
                  // 1. If single line filter is chosen: plenty of room, show all stations on that line!
                  // 2. If 'all' labels mode is active: show all.
                  // 3. If 'smart' mode: show key stations (Interchanges, Hubs, Origin, Destination, Selected, Active Route, Hovered),
                  //    OR if user has zoomed in (zoom >= 1.35), show intermediate stations as space permits!
                  const shouldShowLabel =
                    labelDensity === 'all' ||
                    selectedLineFilter !== 'ALL' ||
                    isSelected ||
                    isFrom ||
                    isTo ||
                    isRoute ||
                    isHovered ||
                    (labelDensity === 'smart' && (isHub || zoom >= 1.35));

                  const pos = getLabelPosition(st, idx);
                  const labelX = st.x + pos.xOffset;
                  const labelY = st.y + pos.yOffset;

                  return (
                    <g
                      key={`st-node-${st.id}`}
                      className="cursor-pointer group"
                      opacity={stationOpacity}
                      onClick={() => setSelectedStation(st)}
                      onMouseEnter={() => setHoveredStation(st)}
                      onMouseLeave={() => setHoveredStation(null)}
                    >
                      {/* Generous touch/click hit-target area */}
                      <circle cx={st.x} cy={st.y} r="16" fill="transparent" />

                      {/* Pulsing ring on selection or origin/destination */}
                      {(isSelected || isFrom || isTo || isHovered) && (
                        <circle
                          cx={st.x}
                          cy={st.y}
                          r="15"
                          fill="none"
                          stroke={isFrom ? '#10B981' : isTo ? '#EF4444' : '#FACC15'}
                          strokeWidth="2.5"
                          className="animate-pulse"
                          opacity="0.9"
                        />
                      )}

                      {/* Interchange outer white ring */}
                      {isInterchange && (
                        <circle
                          cx={st.x}
                          cy={st.y}
                          r="8"
                          fill="#FFFFFF"
                          stroke="#0F172A"
                          strokeWidth="2"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={st.x}
                        cy={st.y}
                        r={isFrom || isTo || isSelected ? 8 : isInterchange ? 6 : 4.5}
                        fill={
                          isFrom
                            ? '#10B981'
                            : isTo
                            ? '#EF4444'
                            : isSelected
                            ? '#FACC15'
                            : isInterchange
                            ? '#FFFFFF'
                            : isYellowBlack
                            ? '#FACC15'
                            : st.lines.length > 0
                            ? MRT_LINE_META[st.lines[0]]?.color || '#38BDF8'
                            : '#FFFFFF'
                        }
                        stroke={
                          isYellowBlack
                            ? '#000000'
                            : isFrom
                            ? '#064E3B'
                            : isTo
                            ? '#7F1D1D'
                            : isSelected
                            ? '#92400E'
                            : '#0F172A'
                        }
                        strokeWidth={isInterchange ? 2.5 : 1.5}
                      />

                      {/* Legible Station Name */}
                      {shouldShowLabel && (
                        <g>
                          {/* Contrast Pill behind Selected or Origin/Dest or Hub labels */}
                          {(isSelected || isFrom || isTo) && (
                            <rect
                              x={labelX - 44}
                              y={labelY - 10}
                              width="88"
                              height="16"
                              rx="8"
                              fill={isFrom ? '#064E3B' : isTo ? '#7F1D1D' : '#78350F'}
                              opacity="0.92"
                            />
                          )}

                          {/* Crisp Station Name Halo Layer */}
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor={pos.anchor}
                            fontSize={isInterchange || isRoute || isSelected ? '10.5' : '9'}
                            fontWeight={isInterchange || isRoute || isSelected ? '800' : '600'}
                            stroke={isSelected || isFrom || isTo ? 'none' : haloColor}
                            strokeWidth={isSelected || isFrom || isTo ? '0' : '3.5'}
                            strokeLinejoin="round"
                            fill="none"
                            className="pointer-events-none select-none"
                          >
                            {getStationDisplayName(st)}
                          </text>

                          {/* Crisp Station Name Fill Layer */}
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor={pos.anchor}
                            fontSize={isInterchange || isRoute || isSelected ? '10.5' : '9'}
                            fontWeight={isInterchange || isRoute || isSelected ? '800' : '600'}
                            fill={
                              isSelected || isFrom || isTo
                                ? '#FFFFFF'
                                : isYellowBlack
                                ? '#FACC15'
                                : '#E2E8F0'
                            }
                            className="pointer-events-none select-none"
                          >
                            {getStationDisplayName(st)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Floating Callout Tooltip for Hovered Station if not selected */}
                {hoveredStation && hoveredStation.id !== selectedStation?.id && (
                  <g
                    transform={`translate(${hoveredStation.x}, ${
                      hoveredStation.y > 100 ? hoveredStation.y - 42 : hoveredStation.y + 20
                    })`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-65"
                      y="-12"
                      width="130"
                      height="26"
                      rx="13"
                      fill="#0F172A"
                      stroke="#FACC15"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {getStationDisplayName(hoveredStation)} ({hoveredStation.codes[0]})
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Selected Station Detailed Action Card */}
      {selectedStation && (
        <div
          id="map-selected-station-card"
          className={`p-3.5 rounded-2xl border transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-400'
              : isHighContrastDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-200/90 shadow-2xs text-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  {getStationDisplayName(selectedStation)}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {selectedStation.codes.join(' / ')}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedStation)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Speak station announcement"
                  aria-label="Announce station"
                >
                  <Volume2 size={14} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {selectedStation.lines.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: MRT_LINE_META[l]?.color }}
                  >
                    {MRT_LINE_META[l]?.shortLabel || l}
                  </span>
                ))}
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedStation.groundLevel === 'UNDERGROUND' ? t.underground : t.elevated}
                </span>
                {selectedStation.accessibility.liftAccessible && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                    <Accessibility size={12} />
                    <span>{t.liftReady}</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {selectedStation.accessibility.averageDecibels} dB
                </span>
              </div>
            </div>

            {/* Set as Start / End Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectFrom(selectedStation.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${
                  fromStationId === selectedStation.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {fromStationId === selectedStation.id ? <Check size={13} /> : null}
                <span>{t.setStart}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTo(selectedStation.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-bounce flex items-center gap-1.5 ${
                  toStationId === selectedStation.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {toStationId === selectedStation.id ? <Check size={13} /> : null}
                <span>{t.setEnd}</span>
              </button>
            </div>
          </div>

          {/* Quick Route Plan Gateway */}
          {fromStationId && toStationId && fromStationId !== toStationId && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.routeReady} <strong className="text-slate-800 dark:text-slate-200">{ALL_STATIONS[fromStationId]?.name}</strong> &rarr; <strong className="text-slate-800 dark:text-slate-200">{ALL_STATIONS[toStationId]?.name}</strong>
              </div>
              <button
                type="button"
                onClick={onNavigateToRoute}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                  isYellowBlack
                    ? 'bg-yellow-400 text-black'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                <span>{t.planRoute}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Accessibility details snippet */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>{t.ramps}:</strong> {selectedStation.accessibility.rampExits.join(', ')}
            </span>
            <span>
              <strong>{t.quietExitsTitle}:</strong> {selectedStation.accessibility.quietExits.join(', ')}
            </span>
            <span>
              <strong>{t.doorsLabel}:</strong> {selectedStation.accessibility.wheelchairBoardingDoors.join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
