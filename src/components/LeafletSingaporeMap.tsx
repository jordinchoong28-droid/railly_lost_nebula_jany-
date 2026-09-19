import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ALL_STATIONS, MRT_EDGES } from '../data/mrtData';
import { MRT_LINE_META } from '../data/translations';
import { ContrastMode, MRTLineCode, StationData } from '../types';
import { LocateFixed, ZoomIn, ZoomOut } from 'lucide-react';

interface LeafletSingaporeMapProps {
  selectedStation: StationData | null;
  onSelectStation: (station: StationData) => void;
  fromStationId: string;
  toStationId: string;
  routeStationIds?: string[];
  contrastMode: ContrastMode;
  selectedLineFilter?: MRTLineCode | 'ALL';
  onSelectFrom?: (id: string) => void;
  onSelectTo?: (id: string) => void;
}

export const LeafletSingaporeMap: React.FC<LeafletSingaporeMapProps> = ({
  selectedStation,
  onSelectStation,
  fromStationId,
  toStationId,
  routeStationIds = [],
  contrastMode,
  selectedLineFilter = 'ALL',
  onSelectFrom,
  onSelectTo,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  const isDark = contrastMode === 'high-contrast-dark';
  const isYellowBlack = contrastMode === 'high-contrast-light';

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false, // We render custom ergonomic touch zoom controls
      });

      mapInstanceRef.current = map;
      polylinesLayerRef.current = L.layerGroup().addTo(map);

      // Force layout invalidation so all tiles load properly
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Manage tile layer based on contrast mode
    const tileUrl = isDark || isYellowBlack
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO &copy; LTA Singapore',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // ResizeObserver to handle tab switching and container resizing
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isDark, isYellowBlack]);

  // Update polylines and station markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Redraw MRT polyline tracks
    if (polylinesLayerRef.current) {
      polylinesLayerRef.current.clearLayers();

      MRT_EDGES.forEach((edge) => {
        if (selectedLineFilter !== 'ALL' && edge.line !== selectedLineFilter) return;

        const stA = ALL_STATIONS[edge.a];
        const stB = ALL_STATIONS[edge.b];
        if (!stA || !stB || !stA.lat || !stB.lat) return;

        const color = MRT_LINE_META[edge.line]?.color || '#94A3B8';
        const isRouteEdge =
          routeStationIds.length > 1 &&
          routeStationIds.includes(edge.a) &&
          routeStationIds.includes(edge.b);

        // Highlight route edge glow
        if (isRouteEdge) {
          L.polyline(
            [
              [stA.lat, stA.lng!],
              [stB.lat, stB.lng!],
            ],
            {
              color: '#F43F5E',
              weight: 8,
              opacity: 0.4,
              lineCap: 'round',
              lineJoin: 'round',
            }
          ).addTo(polylinesLayerRef.current!);
        }

        L.polyline(
          [
            [stA.lat, stA.lng!],
            [stB.lat, stB.lng!],
          ],
          {
            color: isRouteEdge ? '#E11D48' : color,
            weight: isRouteEdge ? 5 : 3.5,
            opacity: isRouteEdge ? 1 : 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }
        ).addTo(polylinesLayerRef.current!);
      });
    }

    // 2. Clear and rebuild station markers
    Object.values(markersRef.current).forEach((m: L.CircleMarker) => m.remove());
    markersRef.current = {};

    Object.values(ALL_STATIONS).forEach((station) => {
      if (!station.lat || !station.lng) return;

      if (selectedLineFilter !== 'ALL' && !station.lines.includes(selectedLineFilter as MRTLineCode)) {
        return;
      }

      const primaryLine = station.lines[0];
      const lineColor = MRT_LINE_META[primaryLine]?.color || '#0284C7';
      const isFrom = station.id === fromStationId;
      const isTo = station.id === toStationId;
      const isSelected = selectedStation?.id === station.id;
      const isRoute = routeStationIds.includes(station.id);
      const isInterchange = station.codes.length > 1;

      const markerColor = isFrom
        ? '#10B981'
        : isTo
        ? '#E11D48'
        : isSelected
        ? '#F59E0B'
        : lineColor;

      const radius = isFrom || isTo || isSelected ? 9 : isInterchange ? 6.5 : 5;

      const marker = L.circleMarker([station.lat, station.lng], {
        radius,
        fillColor: markerColor,
        color: isYellowBlack ? '#FACC15' : isSelected ? '#78350F' : '#FFFFFF',
        weight: isFrom || isTo || isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      // Rich tooltip
      const crowdBadge =
        station.currentCrowd === 'h'
          ? '<span style="color:#EF4444;font-weight:bold;">● High Crowd</span>'
          : station.currentCrowd === 'l'
          ? '<span style="color:#10B981;font-weight:bold;">● Low Crowd</span>'
          : '<span style="color:#F59E0B;font-weight:bold;">● Moderate</span>';

      const linePills = station.lines
        .map(
          (l) =>
            `<span style="background:${MRT_LINE_META[l]?.color || '#666'};color:#fff;font-size:9px;font-weight:bold;padding:1px 4px;border-radius:3px;margin-right:2px;">${MRT_LINE_META[l]?.shortLabel || l}</span>`
        )
        .join('');

      const tooltipContent = `
        <div style="font-family:system-ui, sans-serif; min-width:140px; padding:3px 1px;">
          <div style="font-weight:800; font-size:13px; color:#0F172A; line-height:1.2;">${station.name}</div>
          <div style="font-size:10px; color:#64748B; margin-top:2px;">${station.codes.join(' / ')} • ${station.groundLevel === 'UNDERGROUND' ? 'Underground' : 'Elevated'}</div>
          <div style="margin-top:4px; margin-bottom:4px;">${linePills}</div>
          <div style="font-size:11px; display:flex; align-items:center; gap:4px;">${crowdBadge}</div>
          <div style="font-size:10px; color:#0369A1; font-weight:600; margin-top:3px;">♿ Lift: ${station.accessibility.liftAccessible ? '100% Step-Free' : 'Partial'}</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -6],
        opacity: 0.96,
        className: 'leaflet-mrt-tooltip',
      });

      marker.on('click', () => {
        onSelectStation(station);
      });

      markersRef.current[station.id] = marker;
    });

    // If selected station changes, pan smoothly to it
    if (selectedStation && selectedStation.lat && selectedStation.lng) {
      map.panTo([selectedStation.lat, selectedStation.lng], { animate: true, duration: 0.4 });
    }
  }, [
    selectedStation,
    fromStationId,
    toStationId,
    routeStationIds,
    selectedLineFilter,
    onSelectStation,
    isYellowBlack,
  ]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([1.3521, 103.8198], 12, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        id="singapore-gis-map-canvas"
        ref={mapContainerRef}
        className="w-full h-full rounded-2xl overflow-hidden z-0"
      />

      {/* Floating Map Navigation Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom In"
          aria-label="Zoom in on map"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom Out"
          aria-label="Zoom out of map"
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Center on Singapore"
          aria-label="Center map on Singapore"
        >
          <LocateFixed size={15} />
        </button>
      </div>

      {/* Legend pill */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
          Start
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300"></span>
          End
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300"></span>
          Selected
        </div>
      </div>
    </div>
  );
};
