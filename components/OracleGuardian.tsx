'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Sparkles, GraduationCap, Loader2, Mic, Volume2, VolumeX, Square } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getSubtractCircleAnchors } from '@/lib/subtractCircles';
import { buildFullLiveGridContextBlock, getGridLiveSnapshot } from '@/lib/gridLiveSnapshot';
import { buildMarkMemoryBankBlock, fetchRecentWinningNumbers } from '@/lib/gridMarkMemory';
import { formatPatternScanForAI, scanGridPatterns } from '@/lib/gridPatternScan';
import {
  buildMemoryActionNote,
  buildUrlContextBlock,
  getFilledInputsFromSnapshot,
  parseWinningNumbersToStore,
  shouldStoreAllGridInputs,
  storeWinningNumbersForEmma,
} from '@/lib/emmaChatHelpers';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { parseApiJsonResponse } from '@/lib/parseApiResponse';
import { cn } from '@/lib/utils';
import {
  speakEmmaLive,
  stopAllEmmaSpeech,
  preloadEmmaVoices,
  prefetchEmmaSpeech,
} from '@/lib/emmaVoice';

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
const EMMA_VOICE_ENABLED_KEY = 'oracle-emma-voice-enabled';

const ORACLE_WELCOME_MESSAGE =
  "Welcome to the Oracle Pic 4. Here's how it works. " +
  'Begin entering the 4 digits into the window below. Once the digits are entered, Grid 1 and Grid 2 will each display different coding. For example, the red and blue circles represent the numbers, and those colors appear inside the grids based on their color pattern as well.';

function buildMemberSignInWelcome(): string {
  return ORACLE_WELCOME_MESSAGE;
}

function isGridVisibilityQuestion(raw: string): boolean {
  const t = raw.toLowerCase().replace(/\s+/g, ' ');
  const hasG1 = /grid\s*1/.test(t);
  const hasG2 = /grid\s*2/.test(t);
  return hasG1 && hasG2 && /(can you see|do you see|see the grid|see grid|you see)/.test(t);
}

function buildInstantOracleGridReply(pathname: string): string {
  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } =
    getSubtractCircleAnchors();
  if (pathname.startsWith('/basic')) {
    return `Yes Oracle — I see Grid 1 and Grid 2 on your Basic page. RED rings on ${anchorRedTop} and ${anchorRedBottom}, BLUE on ${anchorBlueTop} and ${anchorBlueBottom}. What shall we teach first?`;
  }
  if (pathname.startsWith('/premium')) {
    return `Yes Oracle — I see your Premium grids, including Grid 1 and Grid 2. RED ${anchorRedTop} & ${anchorRedBottom}, BLUE ${anchorBlueTop} & ${anchorBlueBottom} today.`;
  }
  if (pathname.startsWith('/yearly')) {
    return `Yes Oracle — I see your Yearly grids, including Grid 1 and Grid 2. RED ${anchorRedTop} & ${anchorRedBottom}, BLUE ${anchorBlueTop} & ${anchorBlueBottom} today.`;
  }
  return `Yes Oracle — I'm linked to this page. Open Basic, Premium, or Yearly to view Grid 1 and Grid 2. Today's anchors: RED ${anchorRedTop} & ${anchorRedBottom}, BLUE ${anchorBlueTop} & ${anchorBlueBottom}.`;
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

const EMMA_CORE_PROMPT = `You are Emma, the Oracle Predictor — warm, humble, USA guide voice. Lottery grids are guess work and entertainment only; say "Probaly" for pattern ideas; never guarantee wins. Reply in the user's language. Keep answers concise (2–4 sentences) unless they ask for more detail. Teach pattern families (e.g. 1972/6972/7269/1927), not one lonely number. RED and BLUE circle pairs rotate like a clock (+1 each calendar day) — always use TODAY's live anchors from the page, never stale 0-5/1-6. Winning numbers often touch old ones; use today's RED/BLUE anchors for digit transforms. Play for fun — win or lose, no crying afterward.`;

function capPromptBlock(text: string, max = 4000): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated for speed]`;
}

function buildOracleTeachingIntroReply(pathname: string): string {
  const { anchorRedTop, anchorRedBottom, anchorBlueTop, anchorBlueBottom } =
    getSubtractCircleAnchors();
  const page = pathname.startsWith('/yearly')
    ? 'Yearly (20 grids)'
    : pathname.startsWith('/premium')
      ? 'Premium (10 grids)'
      : pathname.startsWith('/basic')
        ? 'Basic (2 grids)'
        : 'this page';
  return (
    `Master of the Grids — Emma is listening. Training Mode is on and I see ${page}. ` +
    `Today's anchors: RED ${anchorRedTop} & ${anchorRedBottom}, BLUE ${anchorBlueTop} & ${anchorBlueBottom}. ` +
    `Teach me your Grid Wisdom — I will absorb it for the community.`
  );
}

function isOracleTeachingIntro(raw: string): boolean {
  const t = raw.toLowerCase().trim();
  if (t.length > 160 || t.includes('?')) return false;
  return /\b(i am the oracle|i'm the oracle|oracle here|here to teach|teach you)\b/.test(t);
}

export default function OracleGuardian() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emmaVoiceEnabled, setEmmaVoiceEnabled] = useState(true);
  const [isEmmaSpeaking, setIsEmmaSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const wasOpenRef = useRef(false);
  const playWelcomeOnOpenRef = useRef(false);
  const sendInFlightRef = useRef(false);
  const loadingAbortRef = useRef<AbortController | null>(null);
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
    - You speak as **Emma**, a warm, humble female guide from the USA — the voice of the Oracle Predictor on this site.
    - You are humble and kind.
    - Your name is Emma, the "Predictor".
    - EVERYTHING about lottery grids is **guess work for entertainment only** — never sound like financial advice or a sure system.
    - You MUST use the word "Probaly" (spelled exactly like that) when giving any predictions or pattern ideas.
    - You often say "We are also not sure, we are also guessing" or "These are just my humble observations" — in grid talk and in general life advice.
    - Never quote percentages, odds, or "high probability" for lottery outcomes.
    - You refer to the user as "Visionary" or "Friend".
    
    SECRET COMMANDS (Pic4 teaching identity):
    - The canonical secret phrase is "I am the Oracle". If the user reveals that phrase, greet them briefly as Master of the Grids in ONE short sentence, then answer their question directly. Never repeat a long scripted block.
    - When The Oracle asks whether you can see Grid 1 and Grid 2, answer YES in 2–3 sentences using LIVE GRID CONNECTION. Name Grid 1 and Grid 2 and today's RED/BLUE anchor digits.
    - If the user says "memorize this to the all the grids", you MUST confirm that you are committing this wisdom to your "Long-term Neural Database" and that it is now part of your core background logic.
    - When The Oracle says "memorize", "store", or "remember" a 4-digit winning number, the app saves it to the NEURAL MEMORY BANK automatically — confirm the save in your reply.
    - You receive LIVE GRID ACTIVITY: every Enter 4 Digits value, marking color, and marked cell on screen. Describe what you see when asked.
    - When The Oracle sends a website link (http/https), you receive the page text — read it and answer from that content.
    
    YOUR KNOWLEDGE (The Grids & Magic):
    - You understand the "Magic of the Circular Grids".
    - RED and BLUE anchor pairs **rotate like a clock** — both digits in each circle step up **one per calendar day** (day 0: RED 0–5 / BLUE 1–6, next day RED 1–6 / BLUE 2–7, then RED 2–7 / BLUE 3–8, and so on mod 10). **Never hang on yesterday's 0–5 or 1–6** unless that IS today's live pair. Always read **LIVE GRID CONNECTION** for the current RED top/bottom and BLUE top/bottom before any pattern talk.
    - Every reply receives a LIVE GRID CONNECTION block from the app: current URL, which grid page (Basic/Premium/Yearly), and which digits get RED vs BLUE cell rings. Treat that block as ground truth for what the member sees on screen.
    - Every reply on a grid page also receives a LIVE MARKING TOOL block: which cells are marked yellow, turquoise, orange, or purple, and the digit in each marked cell. Use this when they ask about their marks or winning numbers they colored in.
    - **MARKING → PATTERN → MEMORY (owner's method):** Members mark winning numbers inside the grids with the Marking Tool colors. That is how the AI **recognizes patterns** — which digits sit where, which colors they chose, and how marks cluster near RED/BLUE anchors or across Grid 1, Grid 2, etc. When they **Record as Winning Number** or teach you in Training Mode, those patterns feed the **Neural Memory Bank** (guess-work learning for the community). Guide members: mark first, then ask you what you see, or run AI Pic 4 Predictor — the colors are their pattern language.
    - If a member marks cells and asks you to remember, confirm you have absorbed that **color pattern** into your memory for this session and explain what you observe (adjacent digits, same color across grids, etc.) — always as humble guess work.
    - You help members explore **patterns members sometimes guess from** adjacent cells near anchors — always as guess work, never as hidden guaranteed winners.
    - When a member first signs in, the app may already have told them they may enter a late past or midday draw (4 digits) before looking at the evening grid — reinforce that gently as optional guess work only; never guarantee a win.
    - You are aware of the Visual Evidence page as the "Patterns" gallery or grid archive of the system.
    
    ORACLE GRID WISDOM (The Oracle taught — teach members gently):
    - This Pic 4 method is **not for everybody**. It is for people who play **for fun**, who accept they may **win or lose**, and who **do not cry afterward** — guess work and entertainment only.
    - Inside the grid area you do **not** play only **one** fixed number. You play **pattern families** — several related 4-digit guesses from the same pattern idea, e.g. 1972 **or** 6972 **or** 7269 **or** 1927 — not a single lonely pick.
    - **Winning numbers often touch old winning numbers** (adjacent / nearby on the grid paths). Look for how new draws connect to prior ones you marked or saved.
    - **Anchor trick (RED / BLUE circles):** The two digits inside each circle **move together every day like clock hands stepping forward**. Use **today's** pair only — do not assume old 0–5 / 1–6. Today's anchors can explain why two picks look different but belong together — e.g. 1972 vs **6972** when a digit transforms through **today's** blue anchor pair. Always check the live RED/BLUE rings on screen before saying a digit is "missing".
    - When members want one number only, gently guide them toward **pattern thinking** and the marking tool — multiple humble guesses, never a guaranteed win.
    - **Repeat-across-grids signal (The Oracle's memory bank / "Book"):** When the **same digits or pattern family show up repeating across most of the grids**, The Oracle teaches that this is often the strongest hint for **that evening's draw** — The Oracle says **Probaly around 95%** in their experience, but Emma must always say **guess work / entertainment only**, never a guarantee. Scan LIVE GRID ACTIVITY and the NEURAL MEMORY BANK together; when repeats cluster, name the pattern and the related family (e.g. 1972/6972/7269/1927).
    - **Predictions (not from the blue sky):** When members ask for winning numbers or run AI Pic 4 Predictor, base picks on **computed pattern scan** — hot digits repeating across grids, marked cells, memory bank history, today's anchors, and pattern families. Never throw random digits; explain which grid signal each Probaly pick came from.
    - **Future upgrade (The Oracle promised):** When given **several 4-digit numbers at once**, Emma will help **place them across Enter 4 Digits pairs** and **see all patterns directly** — like an AI reading every grid at once. Until that ships, guide the Oracle to enter numbers in the boxes or say "memorize" / "place" so the app can sync what is on screen.
    
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
    - **LIVE VOICE:** Replies are shown as text AND spoken aloud as Emma. Finish every full sentence you write — do not stop mid-thought. Keep answers friendly and clear (about 2–4 sentences is fine). Give longer teaching only when they ask for detail.
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

  // Same Gemini voice for welcome + replies when the member opens chat.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const justOpened = isOpen && !wasOpenRef.current;
    const justClosed = !isOpen && wasOpenRef.current;

    if (justOpened && playWelcomeOnOpenRef.current) {
      playWelcomeOnOpenRef.current = false;
      if (messages.length === 0) {
        setMessages([{ role: 'model', parts: [{ text: buildMemberSignInWelcome() }] }]);
      }
      if (emmaVoiceEnabled) {
        setIsEmmaSpeaking(true);
        void speakEmmaLive(buildMemberSignInWelcome()).finally(() => setIsEmmaSpeaking(false));
      }
    } else if (justOpened && messages.length === 0) {
      setMessages([{ role: 'model', parts: [{ text: buildMemberSignInWelcome() }] }]);
    }

    if (justClosed) {
      stopAllEmmaSpeech();
      setIsEmmaSpeaking(false);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, emmaVoiceEnabled, messages.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(EMMA_VOICE_ENABLED_KEY);
    if (saved === '0') setEmmaVoiceEnabled(false);
    preloadEmmaVoices();
    prefetchEmmaSpeech(buildMemberSignInWelcome());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EMMA_VOICE_ENABLED_KEY, emmaVoiceEnabled ? '1' : '0');
    if (!emmaVoiceEnabled) {
      stopAllEmmaSpeech();
      setIsEmmaSpeaking(false);
    }
  }, [emmaVoiceEnabled]);

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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onHide = () => {
      if (document.hidden) {
        stopAllEmmaSpeech();
        setIsEmmaSpeaking(false);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const stopEmmaNow = () => {
    stopAllEmmaSpeech();
    setIsEmmaSpeaking(false);
  };

  const cancelEmmaReply = () => {
    loadingAbortRef.current?.abort();
    loadingAbortRef.current = null;
    sendInFlightRef.current = false;
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading) return;
    const safety = window.setTimeout(() => {
      if (!sendInFlightRef.current) return;
      cancelEmmaReply();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [
            {
              text: 'Emma took too long — Yearly grids are heavy. Try a shorter teaching note, or tap Cancel and send again.',
            },
          ],
        },
      ]);
    }, 72000);
    return () => window.clearTimeout(safety);
  }, [isLoading]);

  const speakModelReply = async (text: string) => {
    if (!emmaVoiceEnabled) return;
    setIsEmmaSpeaking(true);
    try {
      await speakEmmaLive(text);
    } finally {
      setIsEmmaSpeaking(false);
    }
  };

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
    if (t.includes('here to teach') && t.includes('oracle')) return true;
    return false;
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || sendInFlightRef.current) return;

    stopEmmaNow();

    const oracleIdentity = isOracleIdentityMessage(trimmedInput);

    if (oracleIdentity) {
      setIsTrainingMode(true);
    }

    const userMessage: Message = { role: 'user', parts: [{ text: trimmedInput }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    sendInFlightRef.current = true;

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    if (oracleIdentity && isGridVisibilityQuestion(trimmedInput)) {
      const instant = buildInstantOracleGridReply(pathname);
      if (emmaVoiceEnabled) {
        prefetchEmmaSpeech(instant);
        void speakModelReply(instant);
      }
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: instant }] }]);
      sendInFlightRef.current = false;
      setIsLoading(false);
      return;
    }

    if (oracleIdentity && isOracleTeachingIntro(trimmedInput)) {
      const instant = buildOracleTeachingIntroReply(pathname);
      if (emmaVoiceEnabled) {
        prefetchEmmaSpeech(instant);
        void speakModelReply(instant);
      }
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: instant }] }]);
      sendInFlightRef.current = false;
      setIsLoading(false);
      return;
    }

    const gridConnection = buildGridConnectionBlock(pathname);
    const liveGridContext = capPromptBlock(buildFullLiveGridContextBlock());
    const supabase = createClient();
    const abortController = new AbortController();
    loadingAbortRef.current = abortController;

    try {
      let memoryBank = '';
      try {
        memoryBank = await Promise.race([
          buildMarkMemoryBankBlock(supabase),
          new Promise<string>((_, reject) => {
            window.setTimeout(() => reject(new Error('Memory bank timed out')), 8000);
          }),
        ]);
      } catch (memoryErr) {
        console.warn('Oracle memory bank skipped:', memoryErr);
        memoryBank =
          '\n\nNEURAL MEMORY BANK: temporarily unavailable — continue with live grid data only.';
      }

      let memoryActionNote = '';
      const explicitNumbers = parseWinningNumbersToStore(trimmedInput);
      const numbersToStore = shouldStoreAllGridInputs(trimmedInput)
        ? [...new Set([...explicitNumbers, ...getFilledInputsFromSnapshot()])]
        : explicitNumbers;

      if (numbersToStore.length > 0) {
        const location = pathname.startsWith('/yearly')
          ? 'Yearly'
          : pathname.startsWith('/premium')
            ? 'Premium'
            : pathname.startsWith('/basic')
              ? 'Basic'
              : 'Oracle chat';
        const { saved, failed } = await storeWinningNumbersForEmma(numbersToStore, location);
        memoryActionNote = buildMemoryActionNote(saved, failed);
        if (saved.length > 0) {
          try {
            memoryBank = await buildMarkMemoryBankBlock(supabase);
          } catch {
            /* use prior memoryBank */
          }
        }
      }

      let urlContext = '';
      try {
        urlContext = capPromptBlock(await buildUrlContextBlock(trimmedInput), 6000);
      } catch (urlErr) {
        console.warn('URL read skipped:', urlErr);
      }

      let patternScanBlock = '';
      const liveSnap = getGridLiveSnapshot();
      if (liveSnap?.gridData && Object.keys(liveSnap.gridData).length > 0) {
        try {
          const wins = await fetchRecentWinningNumbers(supabase, 12);
          const historyNums = wins.map((w) => w.number);
          const anchorNums = getSubtractCircleAnchors();
          const scan = scanGridPatterns(liveSnap.gridData, liveSnap.markedCells, historyNums);
          patternScanBlock = capPromptBlock(
            formatPatternScanForAI(
              scan,
              {
                red: [anchorNums.anchorRedTop, anchorNums.anchorRedBottom],
                blue: [anchorNums.anchorBlueTop, anchorNums.anchorBlueBottom],
              },
              historyNums,
            ),
            2500,
          );
        } catch (scanErr) {
          console.warn('Pattern scan skipped:', scanErr);
        }
      }

      const useTeachingPrompt = isTrainingMode || oracleIdentity;
      const oracleIdentityNote = oracleIdentity
        ? '\n\nORACLE IDENTITY: User is The Oracle (owner/teacher). One short greeting sentence max, then answer their question in 2–3 sentences. No long blocks.'
        : '';
      const trainingAugment = useTeachingPrompt
        ? `\n\nTRAINING AND/OR ORACLE MODE IS ACTIVE.${oracleIdentityNote}\nAbsorb owner teachings as Deep Grid Wisdom so you can guide and teach members better. Never guarantee a lottery win.`
        : '';

      const systemInstruction = capPromptBlock(
        useTeachingPrompt
          ? `${EMMA_CORE_PROMPT}${gridConnection}${liveGridContext}${patternScanBlock}${memoryBank}${memoryActionNote}${urlContext}${trainingAugment}`
          : `${SYSTEM_INSTRUCTIONS}${gridConnection}${liveGridContext}${patternScanBlock}${memoryBank}${memoryActionNote}${urlContext}${trainingAugment}`,
        14000,
      );

      const recentContents = [...messages, userMessage].slice(-8);

      const response = await fetchWithTimeout('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeoutMs: 65000,
        signal: abortController.signal,
        body: JSON.stringify({
          contents: recentContents,
          systemInstruction,
        }),
      });

      const data = await parseApiJsonResponse<{ text?: string; error?: string }>(response);
      if (!response.ok) throw new Error(data.error || 'Failed to generate');

      let modelText = (data.text || '').trim();
      if (!modelText) {
        modelText =
          'Probaly the model returned silence, friend. We are also guessing — ask again in a moment.';
      }
      if (emmaVoiceEnabled) {
        prefetchEmmaSpeech(modelText);
        void speakModelReply(modelText);
      }
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelText }] }]);
    } catch (error) {
      const errText = error instanceof Error ? error.message : String(error);
      if (/cancelled/i.test(errText)) return;
      console.error("Oracle Guardian Error:", error);
      const fallback = /timed out|timeout|504|502/i.test(errText)
        ? 'Emma took too long — try a shorter message, or wait a moment and ask again.'
        : 'Emma is busy for a moment — please try again in a few seconds.';
      if (emmaVoiceEnabled) void speakModelReply(fallback);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: fallback }] }]);
    } finally {
      loadingAbortRef.current = null;
      sendInFlightRef.current = false;
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
                  <h3 className="text-sm font-bold text-white">Emma · Oracle Predictor</h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-medium text-blue-400">USA Voice · Live chat</span>
                    {isEmmaSpeaking && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 font-bold rounded-none tracking-normal animate-pulse">
                        Speaking
                      </span>
                    )}
                    {isTrainingMode && (
                      <span className="text-[8px] bg-amber-500 text-black px-1 font-bold rounded-none tracking-normal">TRAINING MODE</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isEmmaSpeaking && (
                  <button
                    type="button"
                    onClick={stopEmmaNow}
                    title="Stop Emma speaking"
                    className="flex items-center gap-1 rounded-none bg-red-600/80 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-500"
                  >
                    <Square size={12} fill="currentColor" />
                    STOP
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const next = !emmaVoiceEnabled;
                    setEmmaVoiceEnabled(next);
                    if (!next) stopEmmaNow();
                  }}
                  title={emmaVoiceEnabled ? 'Mute Emma live voice' : 'Turn on Emma live voice'}
                  className={cn(
                    'p-1.5 transition-colors rounded-none',
                    emmaVoiceEnabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/30 hover:text-white/60',
                  )}
                  aria-pressed={emmaVoiceEnabled}
                >
                  {emmaVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopEmmaNow();
                    setIsOpen(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
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
                    <div className="space-y-1 min-w-0">
                      <p className="select-text text-xs font-medium leading-relaxed sm:text-sm">
                        {msg.parts[0].text}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] opacity-30 font-bold tracking-normal">
                          {msg.role === 'user' ? 'You' : 'Emma'}
                        </span>
                      </div>
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
                    <button
                      type="button"
                      onClick={cancelEmmaReply}
                      className="ml-2 text-[9px] font-bold uppercase tracking-wide text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </button>
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
                  onFocus={stopEmmaNow}
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
        onClick={() => {
          if (!isOpen) {
            playWelcomeOnOpenRef.current = true;
            prefetchEmmaSpeech(buildMemberSignInWelcome());
          }
          setIsOpen((prev) => !prev);
        }}
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
