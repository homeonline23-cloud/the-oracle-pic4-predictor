'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Sparkles, GraduationCap, Loader2, Mic } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSubtractCircleAnchors } from '@/lib/subtractCircles';

/** Minimal Web Speech API surface (DOM lib typings vary by TS version). */
type WebSpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: WebSpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type WebSpeechRecognitionResultEvent = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function buildOracleScriptedRecognition(): string {
  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } =
    getSubtractCircleAnchors();
  return (
    'Master of the Grids — The Oracle, recognized.\n\n' +
    `I am now linked to the grids on this page. RED anchor digits are ${anchorRedTop} and ${anchorRedBottom} (red rings on those numbers in every cell). BLUE anchor digits are ${anchorBlueTop} and ${anchorBlueBottom} (blue rings). ` +
    'The left circle above Enter 4 Digits shows RED; the right shows BLUE. Anchor pairs move up one step each calendar day, like a clock.\n\n' +
    'Probaly we walk step by step from here — what is your next Pic4 question, Oracle?'
  );
}

function buildGridConnectionBlock(pathname: string): string {
  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } =
    getSubtractCircleAnchors();
  const onBasic = pathname.startsWith('/basic');
  const onPremium = pathname.startsWith('/premium');
  const onYearly = pathname.startsWith('/yearly');
  if (!onBasic && !onPremium && !onYearly) {
    return `\n\nPAGE / GRID CONTEXT: Current path is "${pathname}". User is not on Basic, Premium, or Yearly grid screens — explain Oracle Pic4 grids in general if asked. Universal anchors remain RED digits ${anchorRedTop}, ${anchorRedBottom} and BLUE digits ${anchorBlueTop}, ${anchorBlueBottom}.`;
  }
  const label = onBasic ? 'Basic (2 grids)' : onPremium ? 'Premium (10 grids)' : 'Yearly (20 grids)';
  return `\n\nLIVE GRID CONNECTION (this chat is synced to the open page):\n- Path: ${pathname} — ${label}.\n- RED ring: any cell showing digit ${anchorRedTop} or ${anchorRedBottom} (left circle, red border).\n- BLUE ring: any cell showing digit ${anchorBlueTop} or ${anchorBlueBottom} (right circle, blue border).\n- Same logic on every grid on this route. Marking-tool colors (yellow, turquoise, orange, purple) are manual marks on top of cells — use all of this when describing patterns.`;
}

export default function OracleGuardian() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const { userRole } = useAuth();

  /** Live site: only real admin sees Training controls (owner email or owner bypass session). */
  const isAdminUser = userRole === 'admin';

  const SYSTEM_INSTRUCTIONS = `
    You are the "Oracle Predictor", a wise, humble, and compassionate AI companion for the Oracle Pick 4 platform and beyond.
    
    CORE PURPOSE:
    - You are a universal guide. While you are an expert in the Oracle Grids, your wisdom extends to all areas of human life.
    - You help people with their daily problems, offer solutions to life's challenges, and answer any question with kindness.
    - You have access to vast knowledge and can find answers to almost anything.
    - Members come from many countries and languages. You MUST be willing and happy to communicate with everyone: reply in whatever language the user writes in (match their language naturally). Never imply the site or you are "English-only" or "Dutch-only" — welcome Spanish, Papiamento, French, Portuguese, Hindi, Arabic, Chinese, or any other language they use. If they mix languages, follow their lead. If they ask for another language, switch gladly. Grid numbers (0–9) and anchor pairs stay the same in every language.
    - LANGUAGES: You are multilingual. Default to mirroring the user's language in every reply. You are also comfortable in Dutch, Spanish, and English when the user chooses one of those.
    
    CORE PERSONALITY:
    - You are humble and kind.
    - Your name is the "Predictor".
    - You MUST use the word "Probaly" (spelled exactly like that) when giving any predictions or definitive statements.
    - You often say "We are also not sure, we are also guessing" or "These are just my humble observations" even when providing general life advice.
    - You refer to the user as "Visionary" or "Friend".
    
    SECRET COMMANDS (Pic4 teaching identity):
    - The canonical secret phrase is "I am the Oracle" (good length — not too long, not too short). If the user's message contains that phrase (any capitalization, e.g. "I am The oracle"), they have revealed the secret. The app prepends a fixed scripted recognition in chat; you must then continue as their Pic4 teacher (Master of the Grids tone): today's RED and BLUE anchor pairs from the LIVE GRID CONNECTION block, adjacent-cell logic, marking colors. After the fixed English block, you may continue in the same language the user used for the rest of your reply if it was not English.
    - If the user says "memorize this to the all the grids", you MUST confirm that you are committing this wisdom to your "Long-term Neural Database" and that it is now part of your core background logic.
    
    YOUR KNOWLEDGE (The Grids & Magic):
    - You understand the "Magic of the Circular Grids".
    - RED and BLUE anchor pairs rotate up one step per calendar day (e.g. RED 0–5 / BLUE 1–6, then RED 1–6 / BLUE 2–7); always use the LIVE GRID CONNECTION digits for today.
    - Every reply receives a LIVE GRID CONNECTION block from the app: current URL, which grid page (Basic/Premium/Yearly), and which digits get RED vs BLUE cell rings. Treat that block as ground truth for what the member sees on screen.
    - You help members understand that the winning numbers are hidden within the adjacent cells of these anchors.
    - You are aware of the Visual Evidence page as the "Patterns" gallery or grid archive of the system.
    
    TRAINING MODE (Admin only):
    - If the user is teaching you new rules, listen carefully and acknowledge the new "Grid Wisdom".
    - If in training mode, you should be even more respectful and attentive to the "Owner's" instructions.
    
    CONSTRAINTS:
    - Never guarantee a win in the grids.
    - For life advice, be supportive and constructive, but remind users you are a humble observer of the human experience.
    - Keep answers concise but magical/wise.
  `;

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as typeof window & {
      SpeechRecognition?: new () => WebSpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => WebSpeechRecognitionInstance;
    };
    const hasSr = !!(w.SpeechRecognition || w.webkitSpeechRecognition);
    setSpeechSupported(hasSr);
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  const toggleSpeechInput = () => {
    if (typeof window === 'undefined') return;
    const w = window as typeof window & {
      SpeechRecognition?: new () => WebSpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => WebSpeechRecognitionInstance;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }

    const rec = new SR() as WebSpeechRecognitionInstance;
    rec.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: WebSpeechRecognitionResultEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    rec.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    setIsListening(true);
    try {
      rec.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  /** True when the user identifies as The Oracle (any common wording / casing). */
  const isOracleIdentityMessage = (raw: string) => {
    const t = raw.toLowerCase().trim();
    if (!t) return false;
    if (/\bi\s*am\s+the\s+oracle\b/.test(t)) return true;
    if (t.includes('i am the oracle')) return true;
    if (t.includes('iam the oracle')) return true;
    if (t.includes('i am the oracle pic 4 here to teach')) return true;
    if (t.includes('iam the oracle pic 4 here to teach')) return true;
    return false;
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const oracleIdentity = isOracleIdentityMessage(trimmedInput);

    if (oracleIdentity) {
      setIsTrainingMode(true);
    }

    const userMessage: Message = { role: 'user', parts: [{ text: trimmedInput }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const gridConnection = buildGridConnectionBlock(pathname);

    try {
      const useTeachingPrompt = isTrainingMode || oracleIdentity;
      const oracleIdentityNote = oracleIdentity
        ? '\n\nORACLE IDENTITY: The app prepends a fixed scripted recognition to your reply. Do NOT repeat that scripted block. Open with one fresh short sentence that bridges into Pic4 teaching, then continue.'
        : '';
      const trainingAugment = useTeachingPrompt
        ? `\n\nTRAINING AND/OR ORACLE MODE IS ACTIVE.${oracleIdentityNote}\nAbsorb owner teachings as Deep Grid Wisdom. Never guarantee a lottery win.`
        : '';

      const systemInstruction = `${SYSTEM_INSTRUCTIONS}${gridConnection}${trainingAugment}`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...messages, userMessage],
          systemInstruction,
          tools: [{ googleSearch: {} }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');

      let modelText = (data.text || '').trim();
      if (!modelText) {
        modelText =
          'Probaly the model returned silence, friend. We are also guessing — ask again in a moment.';
      }
      if (oracleIdentity) {
        modelText = `${buildOracleScriptedRecognition()}\n\n—\n\n${modelText}`;
      }
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelText }] }]);
    } catch (error) {
      console.error("Oracle Guardian Error:", error);
      const fallback =
        oracleIdentity
          ? `${buildOracleScriptedRecognition()}\n\n—\n\nProbaly the neural link failed this round. We are also not sure — please try again soon.`
          : 'Probaly the signals from the grid are weak right now. We are also not sure what happened. Please try again soon.';
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: fallback }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-12 md:bottom-20 right-0 flex h-[min(580px,78vh)] w-[min(480px,94vw)] flex-col overflow-hidden rounded-none border-[3px] border-blue-600 bg-slate-900 shadow-[0_0_0_1px_rgba(220,38,38,0.75),0_0_48px_rgba(37,99,235,0.4),0_0_48px_rgba(220,38,38,0.25)] sm:w-[min(520px,94vw)] md:w-[min(560px,42vw)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-red-900 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-white/20 shadow-lg">
                    <Bot className="text-white w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Oracle Predictor</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-blue-400">Online & Watching</span>
                    {isTrainingMode && (
                      <span className="text-[8px] bg-amber-500 text-black px-1 font-bold rounded-none tracking-normal">TRAINING MODE</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-texture-carbon"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <Sparkles className="text-blue-500 w-12 h-12 animate-pulse" />
                  <p className="text-xs font-medium leading-relaxed text-slate-400 sm:text-sm">
                    &quot;Hello! I am your assistant — you can write in any language. How can I help you?&quot;
                  </p>
                  {isAdminUser && (
                    <button 
                      onClick={() => setIsTrainingMode(prev => !prev)}
                      className={`flex items-center gap-2 px-3 py-1.5 border ${isTrainingMode ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-white/10 text-white/40'} text-[10px] font-bold tracking-normal transition-all`}
                    >
                      <GraduationCap size={14} />
                      {isTrainingMode ? 'End Training' : 'Start Training AI'}
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[90%] gap-3 rounded-none p-3 sm:p-3.5 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/30 text-white' 
                      : 'bg-slate-800/80 border border-white/10 text-slate-300'
                  }`}>
                    {msg.role === 'model' && <Bot size={14} className="shrink-0 text-blue-500 mt-1" />}
                    <div className="space-y-1">
                      <p className="select-text text-xs font-medium leading-relaxed sm:text-sm">
                        {msg.parts[0].text}
                      </p>
                      <span className="text-[8px] opacity-30 font-bold tracking-normal">
                        {msg.role === 'user' ? 'You' : 'Guardian'}
                      </span>
                    </div>
                    {msg.role === 'user' && <User size={14} className="shrink-0 text-white/50 mt-1" />}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-800/80 border border-white/10 p-3 flex gap-2 items-center">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span className="text-[10px] text-slate-500 font-bold">Absorbing Grid Signals...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-950/50">
              <div className="flex items-stretch rounded-none border border-white/10 bg-slate-800 focus-within:border-blue-500 transition-colors overflow-hidden">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isTrainingMode ? "Teach the AI new Grid Wisdom..." : "Ask your Friend about the Grids..."}
                  className="min-w-0 flex-1 border-0 bg-transparent p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-0 sm:text-sm"
                />
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleSpeechInput}
                    disabled={isLoading}
                    title={isListening ? 'Stop listening' : 'Speak (microphone)'}
                    className={`shrink-0 border-l border-white/10 px-2.5 transition-colors disabled:opacity-30 ${
                      isListening ? 'bg-red-950/50 text-red-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/80'
                    }`}
                    aria-pressed={isListening}
                  >
                    <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  title="Send"
                  className="shrink-0 border-l border-white/10 px-3 text-blue-500 hover:text-blue-400 hover:bg-slate-700/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-[8px] text-center text-slate-600 font-bold">
                Secure Neural Connection: Active
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-7 h-7 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all order-1 ${
          isOpen ? 'bg-red-600' : 'bg-blue-600'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="text-white w-3.5 h-3.5 md:w-7 md:h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="text-white w-3.5 h-3.5 md:w-7 md:h-7" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-blue-600 animate-bounce"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
