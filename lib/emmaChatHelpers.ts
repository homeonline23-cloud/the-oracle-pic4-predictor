import { getGridLiveSnapshot } from '@/lib/gridLiveSnapshot';
import { recordWinningNumberClient } from '@/lib/recordWinningNumber';

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return [...new Set(matches.map((u) => u.replace(/[.,;:!?)]+$/, '')))];
}

/** 4-digit numbers the user asked Emma to save to the neural memory bank. */
export function parseWinningNumbersToStore(text: string): string[] {
  const lower = text.toLowerCase();
  const numbers = [...text.matchAll(/\b(\d{4})\b/g)].map((match) => match[1]);
  if (numbers.length === 0) return [];

  const hasAction = /\b(memorize|remember|store|save|add|record|put)\b/.test(lower);
  if (!hasAction) return [];

  const aboutMemory =
    /\b(winning|number|memory|bank|grids?|digits?|pic\s*4|pick\s*4|draw|this)\b/.test(lower) ||
    /\b(memorize|remember|store)\s+\d{4}\b/.test(lower);

  return aboutMemory ? [...new Set(numbers)] : [];
}

export function shouldStoreAllGridInputs(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\b(all|every)\b/.test(lower) &&
    /\b(memorize|remember|store|save|record)\b/.test(lower) &&
    /\b(grid|input|digit|winning|number)\b/.test(lower)
  );
}

export function getFilledInputsFromSnapshot(): string[] {
  const snap = getGridLiveSnapshot();
  if (!snap?.inputs?.length) return [];
  return snap.inputs.map((v) => v.trim()).filter((v) => /^\d{4}$/.test(v));
}

export async function storeWinningNumbersForEmma(
  numbers: string[],
  location: string,
): Promise<{ saved: string[]; failed: string[] }> {
  const saved: string[] = [];
  const failed: string[] = [];

  for (const number of numbers) {
    const result = await recordWinningNumberClient(number, location);
    if (result.ok) saved.push(number);
    else failed.push(number);
  }

  return { saved, failed };
}

export function buildMemoryActionNote(saved: string[], failed: string[]): string {
  if (saved.length === 0 && failed.length === 0) return '';
  const parts: string[] = [];
  if (saved.length > 0) {
    parts.push(`Saved to neural memory bank: ${saved.join(', ')}`);
  }
  if (failed.length > 0) {
    parts.push(`Could not save: ${failed.join(', ')} (sign in or try Record as Winning Number)`);
  }
  return `\n\nMEMORY ACTION (just completed):\n${parts.join('\n')}`;
}

export async function fetchUrlContentForEmma(url: string): Promise<string> {
  try {
    const res = await fetch('/api/read-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string; url?: string };
    if (!res.ok) {
      return `[Could not read ${url}: ${data.error ?? 'error'}]`;
    }
    return `URL: ${data.url ?? url}\n${data.text ?? ''}`;
  } catch {
    return `[Could not read ${url}: network error]`;
  }
}

export async function buildUrlContextBlock(text: string): Promise<string> {
  const urls = extractUrls(text);
  if (urls.length === 0) return '';

  const chunks = await Promise.all(urls.slice(0, 2).map((url) => fetchUrlContentForEmma(url)));
  return (
    '\n\nWEB LINKS THE ORACLE SHARED (read and use in your answer):\n' +
    chunks.join('\n---\n') +
    '\nSummarize what matters for grids or teaching. Mention the source URL briefly.'
  );
}
