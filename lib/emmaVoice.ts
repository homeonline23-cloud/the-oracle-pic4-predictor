/** Emma (USA) — one Gemini voice for welcome and live replies. */
export function stripTextForSpeech(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/—/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

let emmaLiveAudio: HTMLAudioElement | null = null;
let liveSpeakGeneration = 0;

type SpeechResult = { audioBase64: string; mimeType: string };

/** In-flight TTS fetches keyed by chunk text — prefetch while user opens chat. */
const ttsPrefetch = new Map<string, Promise<SpeechResult | null>>();

function pauseLiveAudio(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (emmaLiveAudio) {
    emmaLiveAudio.pause();
    emmaLiveAudio.currentTime = 0;
    emmaLiveAudio = null;
  }
}

export function stopAllEmmaSpeech(): void {
  liveSpeakGeneration += 1;
  pauseLiveAudio();
}

const CHUNK_MAX = 220;
const REST_CHUNK_MAX = 220;
/** Tiny replies only — one TTS call. */
const SINGLE_SPEAK_MAX = 95;
/** First chunk stays small so Emma starts in ~2–5s, not ~20s. */
const FAST_FIRST_MAX = 115;
const MIN_FIRST_CHUNK = 45;

function splitLongAtWords(text: string, maxLen: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const parts: string[] = [];
  let rest = trimmed;

  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(' ', maxLen);
    if (cut <= 0) cut = maxLen;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);
  return parts;
}

function splitIntoSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

/** Fast natural opener, then queue the rest — never a lone word like "WELCOME!". */
function splitIntoSpeechChunks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= SINGLE_SPEAK_MAX) return [trimmed];

  const parts = splitIntoSentences(trimmed);
  if (!parts.length) return splitLongAtWords(trimmed, CHUNK_MAX);

  let opening = parts[0];
  let start = 0;
  while (start + 1 < parts.length) {
    const candidate = `${opening} ${parts[start + 1]}`.trim();
    if (opening.length >= MIN_FIRST_CHUNK && candidate.length > FAST_FIRST_MAX) break;
    if (candidate.length <= FAST_FIRST_MAX) {
      start += 1;
      opening = candidate;
    } else break;
  }

  const chunks: string[] = [];
  for (const piece of splitLongAtWords(opening, FAST_FIRST_MAX)) {
    chunks.push(piece);
  }

  let buf = '';
  for (let i = start + 1; i < parts.length; i++) {
    for (const part of splitLongAtWords(parts[i], REST_CHUNK_MAX)) {
      const next = buf ? `${buf} ${part}` : part;
      if (next.length <= REST_CHUNK_MAX) {
        buf = next;
        continue;
      }
      if (buf) chunks.push(buf);
      buf = part;
    }
  }

  if (buf) chunks.push(buf);
  return chunks.filter(Boolean);
}

function scoreEmmaVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (name.includes('emma')) score += 100;
  if (lang.startsWith('en-us')) score += 40;
  if (lang.startsWith('en')) score += 20;
  if (name.includes('natural') || name.includes('neural')) score += 35;
  if (name.includes('google') && name.includes('english') && name.includes('female')) score += 50;
  if (name.includes('aria')) score += 45;
  if (name.includes('samantha')) score += 45;
  if (name.includes('zira')) score += 45;
  if (name.includes('jenny')) score += 40;
  if (name.includes('female')) score += 25;
  return score;
}

function pickBrowserEmmaVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return [...voices].sort((a, b) => scoreEmmaVoice(b) - scoreEmmaVoice(a))[0] ?? null;
}

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    const voice = pickBrowserEmmaVoice();
    if (voice) utter.voice = voice;
    utter.rate = 0.94;
    utter.pitch = 1.03;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

function pcmBase64ToWav(base64: string, sampleRate = 24000): string {
  const binary = atob(base64);
  const byteLength = binary.length;
  const buffer = new ArrayBuffer(44 + byteLength);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + byteLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, byteLength, true);

  const pcmBytes = new Uint8Array(buffer, 44);
  for (let i = 0; i < byteLength; i++) pcmBytes[i] = binary.charCodeAt(i);

  const out = new Uint8Array(buffer);
  let wavBinary = '';
  for (let i = 0; i < out.length; i++) wavBinary += String.fromCharCode(out[i]);
  return btoa(wavBinary);
}

function prepareAudioPlayback(base64: string, mimeType: string): { base64: string; mime: string } {
  if (mimeType.includes('pcm') || mimeType.includes('L16')) {
    const rateMatch = mimeType.match(/rate=(\d+)/i);
    const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
    return { base64: pcmBase64ToWav(base64, rate), mime: 'audio/wav' };
  }
  return { base64, mime: mimeType || 'audio/mp3' };
}

function playBase64Audio(base64: string, mimeType: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    try {
      const prepared = prepareAudioPlayback(base64, mimeType);
      emmaLiveAudio = new Audio(`data:${prepared.mime};base64,${prepared.base64}`);
      emmaLiveAudio.onended = () => resolve();
      emmaLiveAudio.onerror = () => resolve();
      void emmaLiveAudio.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

async function fetchGeminiSpeech(text: string): Promise<SpeechResult | null> {
  try {
    const res = await fetch('/api/emma-speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      audioBase64?: string;
      mimeType?: string;
    };
    if (res.ok && data.audioBase64) {
      return { audioBase64: data.audioBase64, mimeType: data.mimeType ?? 'audio/mp3' };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchGeminiSpeechWithRetry(
  text: string,
  retries = 2,
): Promise<SpeechResult | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const audio = await fetchGeminiSpeech(text);
    if (audio) return audio;
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  return null;
}

function prefetchSpeechChunk(text: string): void {
  const key = text.trim();
  if (!key || ttsPrefetch.has(key)) return;
  ttsPrefetch.set(key, fetchGeminiSpeechWithRetry(key));
}

async function getSpeechChunk(text: string): Promise<SpeechResult | null> {
  const key = text.trim();
  const pending = ttsPrefetch.get(key);
  if (pending) {
    ttsPrefetch.delete(key);
    return pending;
  }
  return fetchGeminiSpeechWithRetry(key);
}

/** Start loading Emma audio before chat opens (call on page load / chat button click). */
export function prefetchEmmaSpeech(text: string): void {
  if (typeof window === 'undefined') return;
  const chunks = splitIntoSpeechChunks(stripTextForSpeech(text));
  for (const chunk of chunks) prefetchSpeechChunk(chunk);
}

/**
 * Live reply: small first chunk plays fast; rest prefetched in parallel.
 */
export async function speakEmmaLive(text: string): Promise<void> {
  const cleaned = stripTextForSpeech(text);
  if (!cleaned || typeof window === 'undefined') return;

  pauseLiveAudio();
  const myGen = ++liveSpeakGeneration;

  const chunks = splitIntoSpeechChunks(cleaned);
  if (!chunks.length) return;

  for (const chunk of chunks) prefetchSpeechChunk(chunk);

  for (let i = 0; i < chunks.length; i++) {
    if (myGen !== liveSpeakGeneration) return;

    const audio = await getSpeechChunk(chunks[i]);
    if (!audio) {
      await speakWithBrowser(chunks.slice(i).join(' '));
      return;
    }

    await playBase64Audio(audio.audioBase64, audio.mimeType);
  }
}

export function preloadEmmaVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const load = () => {
    window.speechSynthesis.getVoices();
  };
  if (window.speechSynthesis.getVoices().length) {
    load();
    return;
  }
  window.speechSynthesis.onvoiceschanged = load;
}
