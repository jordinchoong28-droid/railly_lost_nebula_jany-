import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AppTheme, ContrastMode, StructuredNoticeAnalysis, LanguageCode } from '../types';
import { THEME_CONFIG } from '../utils/theme';
import { TRANSLATIONS } from '../data/translations';

interface ServiceNoticeParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  originStation?: string;
  destStation?: string;
  currentPersona?: string;
  contrastMode: ContrastMode;
  theme: AppTheme;
  language?: LanguageCode;
}

const SAMPLE_NOTICES = [
  '[SMRT Alert 15:42] East-West Line: Due to a track circuit fault near Outram Park, trains are running at slower speeds. Please add 15 mins travel time. Free regular bus services are available between Queenstown and City Hall.',
  '[SMRT Update 16:10] Circle Line: Platform screen door calibration at HarbourFront Platform A. Trains moving with +4 min interval.',
  '[SBS Transit Notice] North East Line: Power trip between Dhoby Ghaut and Chinatown. Technicians on site; expect delays of up to 20 minutes.',
  '[LTA Advisory] Heavy downpour affecting above-ground NSL viaducts between Yishun and Khatib. Speed reductions in force.',
];

export const ServiceNoticeParserModal: React.FC<ServiceNoticeParserModalProps> = ({
  isOpen,
  onClose,
  originStation,
  destStation,
  currentPersona,
  contrastMode,
  theme,
  language = 'en',
}) => {
  const [noticeText, setNoticeText] = useState(SAMPLE_NOTICES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StructuredNoticeAnalysis | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  if (!isOpen) return null;

  const handleParseNotice = async () => {
    if (!noticeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/parse-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeText,
          origin: originStation,
          destination: destStation,
          persona: currentPersona,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error('Failed to parse notice:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      id="notice-parser-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="notice-parser-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-parser-title"
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-4.5 flex flex-col gap-3.5 transition-colors ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-400'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isYellowBlack ? 'bg-yellow-400 text-black' : `${themeStyle.softBg} ${themeStyle.primaryText}`
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="notice-parser-title" className="text-sm font-extrabold tracking-tight">
                {t.parseNoticeBtn}
              </h2>
              <p className="text-[11px] opacity-75">
                {t.parseNoticeSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset Sample Notice Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.parseNoticeBtn}:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SAMPLE_NOTICES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNoticeText(sample)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 transition-all ${
                  noticeText === sample
                    ? isYellowBlack
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : `${themeStyle.softBg} ${themeStyle.border} ${themeStyle.primaryText}`
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Notice {idx + 1}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            id="input-raw-service-notice"
            rows={3}
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="Paste raw service notice here..."
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Action button */}
        <button
          type="button"
          id="btn-analyze-notice"
          onClick={handleParseNotice}
          disabled={isAnalyzing}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs ${
            isYellowBlack
              ? 'bg-yellow-400 text-black font-black'
              : `${themeStyle.buttonBg} text-white hover:opacity-90`
          }`}
        >
          <Sparkles size={15} className={isAnalyzing ? 'animate-spin' : ''} />
          <span>{isAnalyzing ? '...' : t.parseNoticeBtn}</span>
        </button>

        {/* Structured Result Display */}
        {analysisResult && (
          <div
            id="parsed-notice-result"
            className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-2.5 animate-in fade-in duration-200 ${
              isYellowBlack
                ? 'border-yellow-400 bg-yellow-400/15 text-yellow-300'
                : analysisResult.advice === 'reroute'
                ? 'border-rose-300 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/40 text-slate-800 dark:text-slate-100'
                : 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-100'
            }`}
          >
            {/* Top row: Line, Delay & Advice */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black text-white">
                  {analysisResult.line}
                </span>
                <span className="font-extrabold text-sm">{analysisResult.lineName}</span>
              </div>

              <div
                className={`px-2.5 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                  analysisResult.advice === 'reroute'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <span>AI Advice: {analysisResult.advice.toUpperCase()}</span>
              </div>
            </div>

            {/* Delay & Escalation Probability */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-current">
                <div className="text-[10px] font-bold opacity-75">Predicted Disruption Duration</div>
                <div className="text-base font-black">~{analysisResult.predictedDelayMins} Mins</div>
                <div className="text-[9px] opacity-60">Reported: +{analysisResult.reportedDelayMins}m</div>
              </div>

              <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-current">
                <div className="text-[10px] font-bold opacity-75">Probability Delay Escalates</div>
                <div className="text-base font-black">{analysisResult.escalationProbability}%</div>
                <div className="text-[9px] opacity-60">
                  {analysisResult.escalationProbability > 50 ? 'High Risk of Extension' : 'Low Risk, Safe to Wait'}
                </div>
              </div>
            </div>

            {/* AI Rationale & Personalized Advice */}
            <div className="space-y-1 bg-white/60 dark:bg-black/40 p-2.5 rounded-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Personalized Advice for Your Route:
              </div>
              <p className="text-xs leading-relaxed font-semibold">
                {analysisResult.personalizedCommuterAdvice}
              </p>
            </div>

            {/* Free Alternatives */}
            {analysisResult.freeAlternatives && analysisResult.freeAlternatives.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold opacity-75">Alternative Transit Activated:</div>
                {analysisResult.freeAlternatives.map((alt, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-1.5 text-[11px] font-medium">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
