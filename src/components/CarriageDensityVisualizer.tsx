import React, { useState } from 'react';
import { Users, Accessibility, CheckCircle2, Clock, Train, ChevronRight } from 'lucide-react';
import { ContrastMode, LanguageCode, MRTLineCode, TrainStatus } from '../types';
import { MRT_LINE_META, TRANSLATIONS } from '../data/translations';
import { getCarriageStatus } from '../data/mrtData';

interface CarriageDensityVisualizerProps {
  line: MRTLineCode;
  stationName: string;
  language: LanguageCode;
  contrastMode: ContrastMode;
}

export const CarriageDensityVisualizer: React.FC<CarriageDensityVisualizerProps> = ({
  line,
  stationName,
  language,
  contrastMode,
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const status: TrainStatus = getCarriageStatus(line);
  const lineMeta = MRT_LINE_META[line];

  const [selectedCar, setSelectedCar] = useState<number>(status.recommendedCar);

  const activeCarData = status.carriages.find((c) => c.carriageNumber === selectedCar) || status.carriages[0];

  return (
    <div
      id="carriage-density-panel"
      aria-label="Live Train Carriage Load Visualizer"
      className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/90 shadow-2xs text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: lineMeta.color }}
          >
            {line}
          </span>
          <div>
            <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>{t.carriageDensity || 'Live Carriage Density'}</span>
            </h3>
            <span className="text-[11px] text-slate-400">@ {stationName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
              isYellowBlack
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Clock size={11} className="text-rose-500" />
            <span>{status.nextArrivalMins} {t.minutes}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
              status.crowdLevel === 'High'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}
          >
            {status.crowdLevel === 'High' ? t.crowdHigh : t.crowdLow}
          </span>
        </div>
      </div>

      {/* Train Direction Banner */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 px-1">
        <span>&larr; {t.carriageFront}</span>
        <span>{t.carriageRear} &rarr;</span>
      </div>

      {/* 6 Carriages Grid: Specially sized to fit mobile screens */}
      <div className="grid grid-cols-6 gap-1 sm:gap-1.5 mb-3">
        {status.carriages.map((car) => {
          const isBest = car.carriageNumber === status.recommendedCar;
          const isCurrentSelected = car.carriageNumber === selectedCar;
          const isDense = car.density > 70;
          const isModerate = car.density >= 45 && car.density <= 70;

          return (
            <button
              key={car.carriageNumber}
              type="button"
              onClick={() => setSelectedCar(car.carriageNumber)}
              className={`rounded-xl p-1.5 border transition-all text-center flex flex-col justify-between items-center tap-bounce ${
                isCurrentSelected
                  ? isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/20 ring-1.5 ring-yellow-400'
                    : 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-1.5 ring-blue-500'
                  : isBest
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-center gap-0.5 w-full">
                <span className="text-[10px] font-extrabold">C{car.carriageNumber}</span>
                {car.wheelchairBay && (
                  <Accessibility size={10} className="text-blue-500 shrink-0" />
                )}
              </div>

              {/* Mini Density Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 my-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isDense ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${car.density}%` }}
                />
              </div>

              <span
                className={`text-[10px] font-bold ${
                  isDense ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {car.density}%
              </span>

              {isBest && (
                <span className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-tighter mt-0.5">
                  {t.bestCarriageBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Carriage Detail Card */}
      {activeCarData && (
        <div
          className={`p-2.5 rounded-xl border mb-3 text-xs transition-colors ${
            activeCarData.carriageNumber === status.recommendedCar
              ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Train size={13} className="text-slate-500" />
              <span>{t.boardCarriage} {activeCarData.carriageNumber}</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activeCarData.density < 45
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeCarData.density <= 70
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {activeCarData.density < 45 ? t.crowdLow : activeCarData.density <= 70 ? t.crowdModerate : t.crowdHigh} ({activeCarData.density}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeCarData.doorAlignment}
            {activeCarData.wheelchairBay && ' • Lift & wheelchair priority bay available.'}
          </p>
        </div>
      )}

      {/* Recommended Platform Guidance */}
      <div
        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
          isYellowBlack
            ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
        }`}
      >
        <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>{t.smartRecommendation}:</strong> {t.boardCarriage} <strong>{status.recommendedCar}</strong>.
        </div>
      </div>
    </div>
  );
};
