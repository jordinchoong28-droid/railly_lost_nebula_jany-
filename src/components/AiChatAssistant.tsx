import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, Volume2, User, Check } from 'lucide-react';
import { AppTheme, ChatMessage, CommuterTripRecord, ContrastMode, LanguageCode, PersonaType } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VoiceService } from '../utils/speech';
import { THEME_CONFIG } from '../utils/theme';
import { getSgTimeString } from '../utils/singaporeTime';

interface AiChatAssistantProps {
  currentPersona: PersonaType;
  fromStationName: string;
  toStationName: string;
  language: LanguageCode;
  contrastMode: ContrastMode;
  onExecuteAction?: (action: string) => void;
  theme?: AppTheme;
  travelHistory?: CommuterTripRecord[];
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  currentPersona,
  fromStationName,
  toStationName,
  language,
  contrastMode,
  onExecuteAction,
  theme = 'pink',
  travelHistory = [],
}) => {
  const t = TRANSLATIONS[language];
  const themeStyle = THEME_CONFIG[theme] || THEME_CONFIG.pink;
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  const CHAT_STORAGE_KEY = 'railly_mrt_chat_history_v1';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse offline chat history:', e);
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: t.aiWelcomeMsg || 'Hello! I am your Singapore MRT & LRT accessibility assistant. How may I help your commute today?',
        timestamp: getSgTimeString(),
        suggestedActions: [
          { label: 'EWL Delay: Wait vs Reroute', action: 'ask_wait_reroute' },
          { label: '4h Weather & Crowds', action: 'check_weather' },
          { label: 'Lift L02 Maintenance (Outram)', action: 'check_lifts' },
          { label: 'Sensory / Quiet Routing', action: 'toggle_sensory' },
        ],
      },
    ];
  });

  // Persist chat to localStorage on message updates
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage:', e);
    }
  }, [messages]);

  // Update welcome message if language changes and only initial message is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            text: t.aiWelcomeMsg || 'Hello! I am your Singapore MRT & LRT accessibility assistant. How may I help your commute today?',
            timestamp: getSgTimeString(),
            suggestedActions: [
              { label: t.tabCarriages, action: 'view_carriages' },
              { label: t.sensoryModeLabel, action: 'toggle_sensory' },
              { label: t.mobilityLabel, action: 'view_accessibility' },
              { label: t.quickStationsLabel, action: 'check_weather' },
            ],
          },
        ];
      }
      return prev;
    });
  }, [language, t]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (userText: string, isFromVoice = false) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: getSgTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-4),
          persona: currentPersona,
          context: {
            origin: fromStationName,
            destination: toStationName,
            travelHistory,
            isVoiceMode: isFromVoice,
            mode:
              currentPersona === 'priya' || currentPersona === 'low-sensory'
                ? 'low-sensory'
                : currentPersona === 'mobility' || currentPersona === 'step-free'
                ? 'step-free'
                : 'carriage-density',
          },
          language,
        }),
      });

      const data = await res.json();
      const botReply = data.reply || 'I am ready to help you navigate Singapore MRT.';

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: botReply,
        timestamp: getSgTimeString(),
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If user queried via hands-free voice, speak the assistant's reply automatically
      if (isFromVoice) {
        VoiceService.speak(botReply, language);
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: t.offlineFallbackMsg || 'Offline mode: You can still use the local router!',
        timestamp: getSgTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    VoiceService.speak(text, language);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const rec = VoiceService.createSpeechRecognizer(
      language,
      (transcript) => {
        setIsListening(false);
        if (transcript) {
          sendMessage(transcript, true);
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (rec) {
      rec.start();
    } else {
      setIsListening(false);
    }
  };

  // Clean Typography Parser: Formats bolding, bullet points, and steps neatly
  const renderCleanMessage = (text: string | undefined | null, isUser: boolean) => {
    const safeText = typeof text === 'string' ? text : '';
    const rawParagraphs = safeText.split('\n').filter((p) => p.trim().length > 0);

    return (
      <div className="space-y-2 text-sm leading-relaxed font-normal">
        {rawParagraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
          const isNumbered = /^\d+[\.\)]\s/.test(trimmed);

          let cleanText = trimmed;
          let bulletPrefix = '';

          if (isBullet) {
            cleanText = trimmed.replace(/^[\*\-•]\s*/, '');
            bulletPrefix = '•';
          } else if (isNumbered) {
            const match = trimmed.match(/^(\d+)[\.\)]\s*/);
            bulletPrefix = match ? match[1] : '';
            cleanText = trimmed.replace(/^\d+[\.\)]\s*/, '');
          }

          // Parse markdown bold text (**bold**)
          const segments = cleanText.split(/(\*\*[^*]+\*\*)/g);
          const formattedContent = segments.map((seg, sIdx) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
              return (
                <strong key={sIdx} className="font-bold tracking-tight">
                  {seg.slice(2, -2)}
                </strong>
              );
            }
            return <span key={sIdx}>{seg}</span>;
          });

          if (isBullet) {
            return (
              <div key={pIdx} className="flex items-start gap-2 pl-0.5">
                <span className={`text-base leading-snug shrink-0 select-none ${
                  isUser ? 'opacity-90' : isYellowBlack ? 'text-yellow-400' : 'text-slate-400'
                }`}>
                  {bulletPrefix}
                </span>
                <div className="flex-1 break-words">{formattedContent}</div>
              </div>
            );
          }

          if (isNumbered) {
            return (
              <div key={pIdx} className="flex items-start gap-2 pl-0.5">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 select-none ${
                  isUser
                    ? 'bg-white/20 text-white'
                    : isYellowBlack
                    ? 'bg-yellow-400 text-black'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}>
                  {bulletPrefix}
                </span>
                <div className="flex-1 break-words">{formattedContent}</div>
              </div>
            );
          }

          return (
            <p key={pIdx} className="break-words">
              {formattedContent}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="ai-chat-assistant"
      aria-label="MRT AI Route & Accessibility Assistant"
      className={`rounded-2xl border shadow-sm flex flex-col h-[540px] transition-all overflow-hidden ${
        isYellowBlack
          ? 'bg-black border-yellow-400 text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Clean Modern Chat Header */}
      <div className="px-4 py-3.5 border-b flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
              isYellowBlack
                ? 'bg-yellow-400 text-black'
                : `${themeStyle.primaryBg} text-white`
            }`}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {t.askAi}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Predictive & Routine-Aware MRT Guide</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const initialMsg: ChatMessage[] = [
                {
                  id: 'welcome',
                  role: 'assistant',
                  text: t.aiWelcomeMsg || 'Hello! I am your Singapore MRT & LRT accessibility assistant. How may I help your commute today?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  suggestedActions: [
                    { label: 'EWL Delay: Wait vs Reroute', action: 'ask_wait_reroute' },
                    { label: '4h Weather & Crowds', action: 'check_weather' },
                    { label: 'Lift L02 Maintenance (Outram)', action: 'check_lifts' },
                    { label: 'Sensory / Quiet Routing', action: 'toggle_sensory' },
                  ],
                },
              ];
              setMessages(initialMsg);
              try {
                localStorage.removeItem(CHAT_STORAGE_KEY);
              } catch (e) {
                // ignore
              }
            }}
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-colors"
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips - Clean Horizontal Scroll */}
      <div className="px-3.5 py-2.5 border-b bg-slate-50/70 dark:bg-slate-950/40 overflow-x-auto scrollbar-none flex gap-2 shrink-0">
        {t.suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(prompt)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors tap-bounce shrink-0 ${
              isYellowBlack
                ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-2xs transition-all ${
                  isUser
                    ? isYellowBlack
                      ? 'bg-yellow-400 text-black font-semibold'
                      : `${themeStyle.primaryBg} text-white font-medium`
                    : isYellowBlack
                    ? 'bg-slate-950 border border-yellow-400 text-yellow-300'
                    : isHighContrastDark
                    ? 'bg-slate-800/90 border border-slate-700 text-slate-100'
                    : 'bg-slate-50/90 text-slate-800 border border-slate-200/80'
                }`}
              >
                {/* Header with uniform typography */}
                <div className="flex items-center justify-between gap-3 mb-2 opacity-75 text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                    <span>{isUser ? t.you : t.mrtCompanion}</span>
                  </span>
                  <span className="text-[11px] font-normal">{msg.timestamp}</span>
                </div>

                {/* Formatted Clean Content */}
                {renderCleanMessage(msg.text, isUser)}

                {/* Read Aloud Button */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isYellowBlack
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <Volume2 size={13} />
                      <span>{t.readAloud}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Chips */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pl-1">
                  {msg.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (act.action === 'check_weather') {
                          sendMessage('What is the current weather and rain forecast for my route?');
                        } else if (onExecuteAction) {
                          onExecuteAction(act.action);
                        }
                      }}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors tap-bounce ${
                        isYellowBlack
                          ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                          : `${themeStyle.activeBgLight} ${themeStyle.primaryText} ${themeStyle.activeBorder}`
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic px-2 py-1">
            <Sparkles size={14} className={`animate-spin ${themeStyle.primaryText}`} />
            <span>{t.consultingAi}</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Field and Voice Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t bg-slate-50/80 dark:bg-slate-900/80 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
            isListening
              ? `${themeStyle.primaryBg} text-white animate-pulse`
              : isYellowBlack
              ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
          }`}
          title="Voice input for AI chat"
          aria-label="Voice input for AI chat"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.aiPlaceholder}
          className={`flex-1 h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
            isYellowBlack
              ? 'bg-black border-yellow-400 text-yellow-300 focus:ring-2 focus:ring-yellow-400'
              : isHighContrastDark
              ? 'bg-slate-800 border-slate-600 text-white focus:border-slate-400'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xs focus:border-slate-400'
          }`}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`h-10 px-3.5 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-40 flex items-center justify-center shrink-0 ${
            isYellowBlack
              ? 'bg-yellow-400 text-black'
              : `${themeStyle.primaryBg} text-white ${themeStyle.primaryBgHover}`
          }`}
          title="Send question"
          aria-label="Send question"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

