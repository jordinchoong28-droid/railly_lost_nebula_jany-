import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, RotateCcw, Globe } from 'lucide-react';
import { CalculatedRoute, ContrastMode, LanguageCode, RouteStep } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceService } from '../utils/speech';

interface VoiceGuidanceBarProps {
  route: CalculatedRoute;
  language: LanguageCode;
  contrastMode: ContrastMode;
  onVoiceCommandResult?: (text: string) => void;
}

const LANGUAGE_LABELS: Record<LanguageCode, { label: string; native: string }> = {
  en: { label: 'English', native: 'English' },
  zh: { label: 'Chinese', native: '简体中文' },
  ms: { label: 'Malay', native: 'Bahasa Melayu' },
  ta: { label: 'Tamil', native: 'தமிழ்' },
  my: { label: 'Burmese', native: 'မြန်မာ' },
};

export const VoiceGuidanceBar: React.FC<VoiceGuidanceBarProps> = ({
  route,
  language,
  contrastMode,
}) => {
  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const [isPlaying, setIsPlaying] = useState(VoiceService.isSpeakingState());
  const [isPaused, setIsPaused] = useState(VoiceService.isPausedState());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Synchronize with VoiceService state changes
  useEffect(() => {
    const unsubscribe = VoiceService.subscribe(() => {
      setIsPlaying(VoiceService.isSpeakingState());
      setIsPaused(VoiceService.isPausedState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentStep: RouteStep | undefined = route.steps[currentStepIndex];

  // Dynamically compute the active step's localized guidance text in current language
  const activeStepText = currentStep
    ? VoiceService.formatGuidanceSpeech(currentStep, currentStepIndex, route.steps.length, language)
    : '';

  // When the app language changes while playing, seamlessly switch spoken announcement to the new language
  useEffect(() => {
    if (isPlaying && !isPaused && currentStep) {
      const updatedText = VoiceService.formatGuidanceSpeech(
        currentStep,
        currentStepIndex,
        route.steps.length,
        language
      );
      const phonetic = VoiceService.formatPhoneticGuidance(
        currentStep,
        currentStepIndex,
        route.steps.length,
        language
      );
      VoiceService.speak(
        updatedText,
        language,
        () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        phonetic
      );
    }
  }, [language]);

  const speakStep = (idx: number) => {
    const step = route.steps[idx];
    if (!step) return;
    const text = VoiceService.formatGuidanceSpeech(step, idx, route.steps.length, language);
    const phonetic = VoiceService.formatPhoneticGuidance(step, idx, route.steps.length, language);
    setIsPlaying(true);
    setIsPaused(false);
    VoiceService.speak(
      text,
      language,
      () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      phonetic
    );
  };

  const handleStart = () => {
    speakStep(currentStepIndex);
  };

  const handlePause = () => {
    VoiceService.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    VoiceService.resume();
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handleStop = () => {
    VoiceService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleNext = () => {
    if (currentStepIndex < route.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      speakStep(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      speakStep(prevIdx);
    }
  };

  const handleRepeat = () => {
    speakStep(currentStepIndex);
  };

  return (
    <div
      id="voice-guidance-toolbar"
      aria-label="Real-Time Multilingual Voice Guidance for Commuters"
      className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/80 text-slate-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isPlaying && !isPaused
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                : isPaused
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : isYellowBlack
                ? 'bg-yellow-400 text-black'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isPaused ? (
              <Pause size={22} className="animate-bounce" />
            ) : isPlaying ? (
              <Volume2 size={22} />
            ) : (
              <VolumeX size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>{t.voiceGuidance}</span>
                {isPaused && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30">
                    {t.voicePause}
                  </span>
                )}
              </h3>
            </div>

            <p
              className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                isYellowBlack ? 'text-yellow-300' : 'text-slate-500'
              }`}
            >
              <Globe size={13} className="shrink-0" />
              <span>
                {LANGUAGE_LABELS[language]?.native} ({LANGUAGE_LABELS[language]?.label})
              </span>
            </p>
          </div>
        </div>

        {/* Accessible Audio Navigation Controls with Pause & Resume */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous step */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`p-2.5 rounded-xl border font-bold disabled:opacity-30 transition-all ${
              isYellowBlack
                ? 'border-yellow-400 hover:bg-yellow-400/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title={t.voicePrev}
            aria-label={t.voicePrev}
          >
            <SkipBack size={18} />
          </button>

          {/* If Speaking: Show Pause button */}
          {isPlaying && !isPaused && (
            <button
              type="button"
              onClick={handlePause}
              className="px-4 py-2.5 rounded-xl border border-amber-500 bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              aria-label={t.voicePause}
            >
              <Pause size={18} />
              <span>{t.voicePause}</span>
            </button>
          )}

          {/* If Paused: Show Resume button */}
          {isPaused && (
            <button
              type="button"
              onClick={handleResume}
              className="px-4 py-2.5 rounded-xl border border-emerald-600 bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95 animate-pulse"
              aria-label={t.voiceResume}
            >
              <Play size={18} />
              <span>{t.voiceResume}</span>
            </button>
          )}

          {/* If Stopped: Show Start Guidance button */}
          {!isPlaying && !isPaused && (
            <button
              type="button"
              onClick={handleStart}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 ${
                isYellowBlack
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
              aria-label={t.voiceStart}
            >
              <Play size={18} />
              <span>{t.voiceStart}</span>
            </button>
          )}

          {/* Stop / Cancel button whenever active or paused */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStop}
              className={`px-3 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                isYellowBlack
                  ? 'border-yellow-400 hover:bg-yellow-400/20 text-yellow-300'
                  : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
              title={t.voiceStop}
              aria-label={t.voiceStop}
            >
              <VolumeX size={18} />
            </button>
          )}

          {/* Repeat active step */}
          <button
            type="button"
            onClick={handleRepeat}
            className={`p-2.5 rounded-xl border font-bold transition-all ${
              isYellowBlack
                ? 'border-yellow-400 hover:bg-yellow-400/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title={t.voiceStart}
            aria-label={t.voiceStart}
          >
            <RotateCcw size={18} />
          </button>

          {/* Next step */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === route.steps.length - 1}
            className={`p-2.5 rounded-xl border font-bold disabled:opacity-30 transition-all ${
              isYellowBlack
                ? 'border-yellow-400 hover:bg-yellow-400/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title={t.voiceNext}
            aria-label={t.voiceNext}
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Paused state notification */}
      {isPaused && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">
          <div className="flex items-center gap-2">
            <Pause size={16} className="shrink-0 text-amber-600" />
            <span>{t.voicePausedStatus}</span>
          </div>
          <button
            type="button"
            onClick={handleResume}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600"
          >
            {t.voiceResume}
          </button>
        </div>
      )}

      {/* Current Vocalized Prompt Transcript */}
      <div
        className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
          isYellowBlack
            ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-300'
            : isHighContrastDark
            ? 'bg-slate-950 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${
                isPaused ? 'bg-amber-500' : isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span>
              {t.step} {currentStepIndex + 1} / {route.steps.length}
            </span>
          </span>
          <span className="uppercase tracking-wider">
            {LANGUAGE_LABELS[language]?.native} ({language.toUpperCase()})
          </span>
        </div>
        <p className="font-sans text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
          {activeStepText || t.voiceStart}
        </p>
      </div>
    </div>
  );
};
