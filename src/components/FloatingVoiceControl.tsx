import React, { useState, useEffect } from 'react';
import { Pause, Play, VolumeX, Volume2 } from 'lucide-react';
import { VoiceService } from '../utils/speech';
import { TRANSLATIONS } from '../data/translations';
import { ContrastMode, LanguageCode } from '../types';

interface FloatingVoiceControlProps {
  language: LanguageCode;
  contrastMode: ContrastMode;
}

export const FloatingVoiceControl: React.FC<FloatingVoiceControlProps> = ({
  language,
  contrastMode
}) => {
  const [isSpeaking, setIsSpeaking] = useState(VoiceService.isSpeakingState());
  const [isPaused, setIsPaused] = useState(VoiceService.isPausedState());

  useEffect(() => {
    const unsub = VoiceService.subscribe(() => {
      setIsSpeaking(VoiceService.isSpeakingState());
      setIsPaused(VoiceService.isPausedState());
    });
    return unsub;
  }, []);

  if (!isSpeaking) return null;

  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';

  return (
    <div
      id="floating-voice-control-bar"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm animate-in slide-in-from-bottom duration-200"
    >
      <div
        className={`p-3 rounded-2xl border-2 shadow-2xl flex items-center justify-between gap-3 ${
          isYellowBlack
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-slate-900/95 backdrop-blur-md border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-3 h-3 rounded-full shrink-0 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
          <div className="min-w-0">
            <div className="text-xs font-black truncate">
              {isPaused
                ? (t.voicePause ? `${t.voicePause}d` : 'Paused')
                : (t.voiceGuidance || 'Voice Guidance Active')}
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isPaused
                ? 'Tap Resume to continue'
                : 'Speaking platform directions'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Pause / Resume Button */}
          {isPaused ? (
            <button
              type="button"
              id="floating-voice-resume-btn"
              onClick={() => VoiceService.resume()}
              className="min-h-[40px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
              aria-label="Resume voice guidance"
            >
              <Play size={15} />
              <span>{t.voiceResume || 'Resume'}</span>
            </button>
          ) : (
            <button
              type="button"
              id="floating-voice-pause-btn"
              onClick={() => VoiceService.pause()}
              className="min-h-[40px] px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
              aria-label="Pause voice guidance"
            >
              <Pause size={15} />
              <span>{t.voicePause || 'Pause'}</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            id="floating-voice-stop-btn"
            onClick={() => VoiceService.stop()}
            className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm active:scale-95"
            aria-label="Stop voice guidance"
          >
            <VolumeX size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
