import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import { GRID_MARK_COLORS, type GridMarkColorName } from '@/lib/gridMarkColors';
import { scanGridPatterns, type GridPatternScan } from '@/lib/gridPatternScan';

export type EmmaGridCommand =
  | { type: 'place-inputs'; inputs: string[] }
  | { type: 'auto-mark'; color?: GridMarkColorName }
  | { type: 'place-and-mark'; inputs: string[]; color?: GridMarkColorName };

type EmmaGridCommandListener = (command: EmmaGridCommand) => void;

const listeners = new Set<EmmaGridCommandListener>();

export function subscribeEmmaGridCommands(listener: EmmaGridCommandListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasEmmaGridCommandListener(): boolean {
  return listeners.size > 0;
}

export function dispatchEmmaGridCommand(command: EmmaGridCommand): boolean {
  if (listeners.size === 0) return false;
  for (const listener of listeners) {
    listener(command);
  }
  return true;
}

export function parseMarkColorFromText(text: string): GridMarkColorName | undefined {
  const lower = text.toLowerCase();
  if (/\bturquoise\b|\bteal\b/.test(lower)) return 'turquoise';
  if (/\borange\b/.test(lower)) return 'orange';
  if (/\bpurple\b/.test(lower)) return 'purple';
  if (/\byellow\b/.test(lower)) return 'yellow';
  return undefined;
}

/** 4-digit numbers the member asked Emma to place into Enter 4 Digits. */
export function parseNumbersToPlace(text: string): string[] {
  const lower = text.toLowerCase();
  const numbers = [...text.matchAll(/\b(\d{4})\b/g)].map((match) => match[1]);
  if (numbers.length === 0) return [];

  const placeGrid =
    /\b(place|fill|enter|put|load|set|type|use)\b/.test(lower) &&
    /\b(grid|grids|digit|digits|boxes|pairs?|screen|enter\s*4|inputs?)\b/.test(lower);

  const placeShortcut =
    /\bplace\b/.test(lower) ||
    /\bfill\b.*\bgrids?\b/.test(lower) ||
    /\bauto[- ]?place\b/.test(lower);

  const winningHistory =
    /\b(winning|past|draw|history|numbers?)\b/.test(lower) &&
    /\b(place|put|enter|use|load|fill)\b/.test(lower);

  if (placeGrid || placeShortcut || winningHistory) {
    return [...new Set(numbers)];
  }

  return [];
}

export function isPlaceNumbersRequest(text: string): boolean {
  return parseNumbersToPlace(text).length > 0;
}

export function shouldAutoMarkFromPlace(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\bauto[- ]?mark\b/.test(lower) ||
    /\bplace\s+and\s+mark\b/.test(lower) ||
    /\bmark\s+(them|these|grids|patterns?|repeats?)\b/.test(lower) ||
    (/\bmark\b/.test(lower) && /\b(place|fill|enter|put)\b/.test(lower))
  );
}

/** Mark-only requests on already-filled grids (no new numbers). */
export function parseMarkOnlyRequest(text: string): { autoMark: true; color?: GridMarkColorName } | null {
  const lower = text.toLowerCase();
  if (!/\b(mark|marking|highlight|color)\b/.test(lower)) return null;
  if (isPlaceNumbersRequest(text)) return null;

  const wantsAuto =
    /\b(auto|hot|repeat|pattern|repeating|scan|signals?)\b/.test(lower) ||
    /\bmark\s+(my\s+)?grids?\b/.test(lower) ||
    /\buse\s+(the\s+)?marking\s+tool\b/.test(lower);

  if (!wantsAuto) return null;

  return {
    autoMark: true,
    color: parseMarkColorFromText(text) ?? 'yellow',
  };
}

export function markClassForColor(color: GridMarkColorName = 'yellow'): string {
  return GRID_MARK_COLORS.find((c) => c.name === color)?.class ?? GRID_MARK_COLORS[0].class;
}

export function computeAutoMarks(
  gridData: GridDataMap,
  existingMarks: GridMarkedCells,
  markClass: string,
  scan: GridPatternScan,
  placedNumbers: string[] = [],
): GridMarkedCells {
  const hot = new Set(scan.hotDigits);
  const seedDigits = new Set(
    placedNumbers.flatMap((n) => n.split('')).filter((d) => /^\d$/.test(d)),
  );
  const next: GridMarkedCells = { ...existingMarks };

  for (const [gridId, values] of Object.entries(gridData)) {
    if (!values?.some((v) => v != null && v !== '·')) continue;

    const gridMarks = { ...(next[gridId] ?? {}) };
    let added = 0;
    const maxPerGrid = 6;

    values.forEach((digit, idx) => {
      if (digit == null || digit === '·') return;
      if (added >= maxPerGrid) return;
      const isHot = hot.has(digit);
      const isSeed = seedDigits.has(digit);
      if (!isHot && !isSeed) return;
      if (gridMarks[idx] === markClass) return;
      gridMarks[idx] = markClass;
      added += 1;
    });

    if (Object.keys(gridMarks).length > 0) {
      next[gridId] = gridMarks;
    }
  }

  return next;
}

export function applyPlaceToInputs(current: string[], toPlace: string[], maxPairs: number): string[] {
  const next = [...current];
  while (next.length < maxPairs) next.push('');

  toPlace.slice(0, maxPairs).forEach((num, index) => {
    if (/^\d{4}$/.test(num)) next[index] = num;
  });

  return next.slice(0, maxPairs);
}

export function buildPlaceNumbersReply(
  placed: string[],
  maxPairs: number,
  marked: boolean,
  scan?: GridPatternScan,
): string {
  const capped = placed.slice(0, maxPairs);
  const lines = [
    `Done, friend — I placed ${capped.length} past winning number${capped.length === 1 ? '' : 's'} into Enter 4 Digits:`,
    capped.map((n, i) => `• Pair ${i + 1}: **${n}**`).join('\n'),
    'Your grids should update on screen now.',
  ];

  if (marked) {
    lines.push(
      'I used the **marking tool** on hot / repeating digits so you can see the pattern faster (yellow by default — pick another color anytime).',
    );
  }

  if (scan) {
    if (scan.hotDigits.length > 0) {
      lines.push(`Hot digits across grids: **${scan.hotDigits.join(', ')}**`);
    }
    lines.push(`Repeat signal: **${scan.repeatSignalStrength}** — scan the marks and families before you predict.`);
    if (scan.suggestedFamilies.length > 0) {
      lines.push(`Pattern families to watch: ${scan.suggestedFamilies.slice(0, 6).join(', ')}`);
    }
  }

  lines.push('Say **place and mark** with more numbers anytime, or ask what repeats on your grids.');
  return lines.join('\n\n');
}

export function buildAutoMarkReply(scan: GridPatternScan, color: GridMarkColorName): string {
  const hot = scan.hotDigits.length > 0 ? scan.hotDigits.join(', ') : 'none yet';
  return (
    `Marking tool applied (${color}) on repeating / hot digits across your grids.\n\n` +
    `Hot digits: **${hot}**\n` +
    `Repeat signal: **${scan.repeatSignalStrength}**\n\n` +
    'Look at the colored cells — that is where patterns cluster. Guess work only; say Probaly, never guarantee.'
  );
}

export function buildNotOnGridPageReply(): string {
  return (
    'Friend — open your **Basic**, **Premium**, or **Yearly** grid page first, then tell me to **place** your numbers ' +
    '(e.g. "place 1234 6972 on my grids" or "place and mark 1234 5678"). I will fill Enter 4 Digits and use the marking tool for you.'
  );
}
