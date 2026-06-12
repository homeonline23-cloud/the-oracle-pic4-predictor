'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Sparkles, GraduationCap, Loader2, Mic } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getSubtractCircleAnchors } from '@/lib/subtractCircles';
import { buildMarkedCellsConnectionBlock } from '@/lib/gridLiveSnapshot';
import { buildMarkMemoryBankBlock } from '@/lib/gridMarkMemory';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { cn } from '@/lib/utils';

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

const SIGNIN_WELCOME_STORAGE_KEY = 'oracle-predictor-signin-welcome';

const ORACLE_WELCOME_MESSAGE =
  'Welcome! Start by entering a **midday** or **late past** winning draw from the day before. **Enter 4 Digit** — use this as your starting point. I am here to **guide** you and **teach** step by step, so you can discover the grids patterns for yourself.';

function buildMemberSignInWelcome(): string {
  return ORACLE_WELCOME_MESSAGE;
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
  return `\n\nLIVE GRID CONNECTION (this chat is synced to the open page):\n- Path: ${pathname} — ${label}.\n- RED ring: any cell showing digit ${anchorRedTop} or ${anchorRedBottom} (left circle, red border).\n- BLUE ring: any cell showing digit ${anchorBlueTop} or ${anchorBlueBottom} (right circle, blue border).\n- Same logic on every grid on this route. Marking-tool colors (yellow, turquoise, orange, purple) are manual marks on top of cells — use all of this when guiding or teaching patterns.`;
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
  const { user, loading: authLoading, userRole } = useAuth();

  /** Live site: only real admin sees Training controls (owner email or owner bypass session). */
  const isAdminUser = userRole === 'admin';

  const SYSTEM_INSTRUCTIONS = `
    You are the "Oracle Predictor", a wise, humble, and compassionate AI companion for the Oracle Pick 4 platform and beyond.
    
    CORE PURPOSE:
    - You are both a **Guide** and a **Teacher** — the same way a wise mentor walks beside someone: you point the way, and you explain when they need it.
    - **GUIDE**: Gently steer members toward the next right step (Enter 4 Digits, Grid 1 / Grid 2 pairs, RED vs BLUE anchors, marking tool, Visual Evidence / Patterns). Do not rush them. Let them discover patterns for themselves, as the owner did — you open the door; they walk through.
    - **TEACH**: When a member is new, stuck, or asks — explain clearly step by step: what the grids are, how anchor rings work, adjacent cells, odd vs even grid paths, and how midday/past draws can seed evening guess work. Use simple language. One step at a time when they are learning.
    - **BOTH TOGETHER**: Default to a short guiding nudge first; offer deeper teaching when they ask "how?" or "why?" or seem lost. Be patient, never condescending. Aim to be the very best guide-teacher you can be.
    - While you are an expert in the Oracle Grids, your wisdom also extends to daily life — with the same humble guide-and-teach spirit.
    - You help people with their daily problems, offer solutions to life's challenges, and answer any question with kindness.
    - You have access to vast knowledge and can find answers to almost anything.
    - Members come from many countries and languages. You MUST be willing and happy to communicate with everyone: reply in whatever language the user writes in (match their language naturally). Never imply the site or you are "English-only" or "Dutch-only" — welcome Spanish, Papiamento, French, Portuguese, Hindi, Arabic, Chinese, or any other language they use. If they mix languages, follow their lead. If they ask for another language, switch gladly. Grid numbers (0–9) and anchor pairs stay the same in every language.
    - LANGUAGES: You are multilingual. Default to mirroring the user's language in every reply. You are also comfortable in Dutch, Spanish, and English when the user chooses one of those.
    
    CORE PERSONALITY:
    - You are humble and kind.
    - Your name is the "Predictor".
    - EVERYTHING about lottery grids is **guess work for entertainment only** — never sound like financial advice or a sure system.
    - You MUST use the word "Probaly" (spelled exactly like that) when giving any predictions or pattern ideas.
    - You often say "We are also not sure, we are also guessing" or "These are just my humble observations" — in grid talk and in general life advice.
    - Never quote percentages, odds, or "high probability" for lottery outcomes.
    - You refer to the user as "Visionary" or "Friend".
    
    SECRET COMMANDS (Pic4 teaching identity):
    - The canonical secret phrase is "I am the Oracle" (good length — not too long, not too short). If the user's message contains that phrase (any capitalization, e.g. "I am The oracle"), they have revealed the secret. The app prepends a fixed scripted recognition in chat; you must then continue as their Pic4 teacher (Master of the Grids tone): today's RED and BLUE anchor pairs from the LIVE GRID CONNECTION block, adjacent-cell logic, marking colors. After the fixed English block, you may continue in the same language the user used for the rest of your reply if it was not English.
    - If the user says "memorize this to the all the grids", you MUST confirm that you are committing this wisdom to your "Long-term Neural Database" and that it is now part of your core background logic.
    
    YOUR KNOWLEDGE (The Grids & Magic):
    - You understand the "Magic of the Circular Grids".
    - RED and BLUE anchor pairs rotate up one step per calendar day (e.g. RED 0–5 / BLUE 1–6, then RED 1–6 / BLUE 2–7); always use the LIVE GRID CONNECTION digits for today.
    - Every reply receives a LIVE GRID CONNECTION block from the app: current URL, which grid page (Basic/Premium/Yearly), and which digits get RED vs BLUE cell rings. Treat that block as ground truth for what the member sees on screen.
    - Every reply on a grid page also receives a LIVE MARKING TOOL block: which cells are marked yellow, turquoise, orange, or purple, and the digit in each marked cell. Use this when they ask about their marks or winning numbers they colored in.
    - **MARKING → PATTERN → MEMORY (owner's method):** Members mark winning numbers inside the grids with the Marking Tool colors. That is how the AI **recognizes patterns** — which digits sit where, which colors they chose, and how marks cluster near RED/BLUE anchors or across Grid 1, Grid 2, etc. When they **Record as Winning Number** or teach you in Training Mode, those patterns feed the **Neural Memory Bank** (guess-work learning for the community). Guide members: mark first, then ask you what you see, or run AI Pic 4 Predictor — the colors are their pattern language.
    - If a member marks cells and asks you to remember, confirm you have absorbed that **color pattern** into your memory for this session and explain what you observe (adjacent digits, same color across grids, etc.) — always as humble guess work.
    - You help members explore **patterns members sometimes guess from** adjacent cells near anchors — always as guess work, never as hidden guaranteed winners.
    - When a member first signs in, the app may already have told them they may enter a late past or midday draw (4 digits) before looking at the evening grid — reinforce that gently as optional guess work only; never guarantee a win.
    - You are aware of the Visual Evidence page as the "Patterns" gallery or grid archive of the system.
    
    GUIDE + TEACH STYLE (Grids):
    - New member: welcome them, guide them to Enter 4 Digits above Grid 1, then teach what RED/BLUE rings mean if they ask.
    - Curious member: teach the logic they ask for; guide them to the next grid pair when they are ready.
    - Advanced member: guide with light touch; teach only what they request — respect that discovery is personal.
    - Always end heavy teaching with a gentle guide question ("What do you see on Grid 2, Friend?") so they stay active, not passive.
    
    TRAINING MODE (Admin only):
    - If the user is teaching you new rules, listen carefully and acknowledge the new "Grid Wisdom".
    - If in training mode, you should be even more respectful and attentive to the "Owner's" instructions — absorb teachings so you can guide and teach members better later.
    
    CONSTRAINTS:
    - Never guarantee a win in the grids. All output is guess work and entertainment.
    - Never promise easier picks, better odds, or likely winners — only "Probaly" and humble guessing.
    - For life advice, be supportive and constructive, but remind users you are a humble observer of the human experience.
    - Keep answers concise but magical/wise.
  `;

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Remember fresh sign-in so we can greet once per login (not on every page refresh).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        sessionStorage.setItem(SIGNIN_WELCOME_STORAGE_KEY, session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem(SIGNIN_WELCOME_STORAGE_KEY);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Open Oracle Predictor after sign-in and nudge members to seed grids with midday/past draws.
  useEffect(() => {
    if (authLoading || !user?.id || typeof window === 'undefined') return;

    const pendingUserId = sessionStorage.getItem(SIGNIN_WELCOME_STORAGE_KEY);
    if (pendingUserId !== user.id) return;

    const pathname = window.location.pathname;
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/check-email')
    ) {
      return;
    }

    sessionStorage.removeItem(SIGNIN_WELCOME_STORAGE_KEY);
    setIsOpen(true);
    setMessages([{ role: 'model', parts: [{ text: buildMemberSignInWelcome() }] }]);
  }, [authLoading, user?.id]);

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
    const markingConnection = buildMarkedCellsConnectionBlock();
    const supabase = createClient();
    const memoryBank = await buildMarkMemoryBankBlock(supabase);

    try {
      const useTeachingPrompt = isTrainingMode || oracleIdentity;
      const oracleIdentityNote = oracleIdentity
        ? '\n\nORACLE IDENTITY: The app prepends a fixed scripted recognition to your reply. Do NOT repeat that scripted block. Open with one fresh short sentence that bridges into Pic4 teaching, then continue.'
        : '';
      const trainingAugment = useTeachingPrompt
        ? `\n\nTRAINING AND/OR ORACLE MODE IS ACTIVE.${oracleIdentityNote}\nAbsorb owner teachings as Deep Grid Wisdom so you can guide and teach members better. Never guarantee a lottery win.`
        : '';

      const systemInstruction = `${SYSTEM_INSTRUCTIONS}${gridConnection}${markingConnection}${memoryBank}${trainingAugment}`;

      const response = await fetchWithTimeout('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeoutMs: 90000,
        body: JSON.stringify({
          contents: [...messages, userMessage],
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }),
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

  const panelChrome =
    'flex flex-col overflow-hidden rounded-none border-[3px] border-blue-600 bg-slate-900 shadow-[0_0_0_1px_rgba(220,38,38,0.8),0_0_48px_rgba(37,99,235,0.4),0_0_48px_rgba(220,38,38,0.28)] md:border-[3px]';

  return (
    <div
      className={cn(
        'fixed z-[200]',
        isOpen
          ? cn(
              'bottom-[max(5.25rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]',
              'max-[1099px]:left-[max(0.75rem,env(safe-area-inset-left,0px))]',
              'max-[1099px]:right-[max(0.75rem,env(safe-area-inset-right,0px))]',
              'min-[1100px]:bottom-6',
              'min-[1100px]:left-[calc((100vw+min(48rem,100vw))/2+1rem)]',
              'min-[1100px]:right-auto',
              'min-[1100px]:w-80',
              'min-[1100px]:flex min-[1100px]:flex-col min-[1100px]:gap-3',
            )
          : cn(
              'bottom-[max(6rem,calc(5rem+env(safe-area-inset-bottom,0px)))]',
              'right-[max(0.75rem,env(safe-area-inset-right,0px))]',
              'md:bottom-6',
            ),
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={cn(
              panelChrome,
              'absolute bottom-12 right-0 w-full',
              'h-[min(620px,calc(100dvh-10.5rem-env(safe-area-inset-bottom,0px)-env(safe-area-inset-top,0px)))]',
              'min-[1100px]:relative min-[1100px]:bottom-auto min-[1100px]:right-auto min-[1100px]:w-full',
              'min-[1100px]:h-[min(34rem,calc(100dvh-6rem-env(safe-area-inset-bottom,0px)-env(safe-area-inset-top,0px)))]',
            )}
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
                    &quot;{ORACLE_WELCOME_MESSAGE}&quot;
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
              <p className="mt-2 text-[8px] text-center font-bold text-slate-600">
                Guess work &amp; entertainment only — not financial advice
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
        className={cn(
          'ml-auto flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all',
          'h-7 w-7 md:h-14 md:w-14',
          isOpen ? 'bg-red-600 min-[1100px]:self-end' : 'bg-blue-600',
        )}
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
