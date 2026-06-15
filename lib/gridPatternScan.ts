import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import { markClassToColorName } from '@/lib/gridMarkColors';

export type GridPatternScan = {
  gridsWithData: number;
  digitGridCounts: Record<string, number>;
  hotDigits: string[];
  markedDigits: string[];
  repeatSignalStrength: 'strong' | 'moderate' | 'weak' | 'none';
  suggestedFamilies: string[];
};

function countDigitAcrossGrids(gridData: GridDataMap): Record<string, number> {
  const counts: Record<string, number> = {};
  let gridsWithData = 0;

  for (const values of Object.values(gridData)) {
    if (!values?.some((v) => v !== null && v !== '·')) continue;
    gridsWithData += 1;
    const seenInGrid = new Set<string>();
    for (const v of values) {
      if (v == null || v === '·') continue;
      seenInGrid.add(String(v));
    }
    for (const d of seenInGrid) {
      counts[d] = (counts[d] ?? 0) + 1;
    }
  }

  return counts;
}

function digitsFromMarks(markedCells: GridMarkedCells, gridData: GridDataMap): string[] {
  const digits = new Set<string>();
  for (const [gridId, cells] of Object.entries(markedCells)) {
    const values = gridData[gridId];
    if (!values) continue;
    for (const [idxStr, markClass] of Object.entries(cells)) {
      if (!markClass || markClassToColorName(markClass) === 'unknown') continue;
      const digit = values[Number(idxStr)];
      if (digit != null) digits.add(String(digit));
    }
  }
  return [...digits];
}

/** Build 4-digit pattern family variants from a seed (Oracle method). */
export function buildPatternFamily(seed: string): string[] {
  const digits = seed.replace(/\D/g, '').slice(0, 4);
  if (digits.length !== 4) return [];
  const set = new Set<string>([digits]);
  set.add(digits.split('').reverse().join(''));
  set.add(digits[3] + digits.slice(0, 3));
  set.add(digits.slice(1) + digits[0]);
  return [...set].filter((n) => /^\d{4}$/.test(n));
}

function mergeFamilies(seeds: string[], limit = 8): string[] {
  const out = new Set<string>();
  for (const seed of seeds) {
    for (const n of buildPatternFamily(seed)) {
      out.add(n);
      if (out.size >= limit) return [...out];
    }
  }
  return [...out];
}

export function scanGridPatterns(
  gridData: GridDataMap,
  markedCells: GridMarkedCells,
  history: string[] = [],
): GridPatternScan {
  const digitGridCounts = countDigitAcrossGrids(gridData);
  const gridsWithData = Object.values(gridData).filter((v) => v?.some((x) => x != null && x !== '·')).length;
  const threshold = Math.max(2, Math.ceil(gridsWithData * 0.55));

  const hotDigits = Object.entries(digitGridCounts)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([digit]) => digit);

  const markedDigits = digitsFromMarks(markedCells, gridData);

  let repeatSignalStrength: GridPatternScan['repeatSignalStrength'] = 'none';
  if (hotDigits.length >= 3 && gridsWithData >= 4) repeatSignalStrength = 'strong';
  else if (hotDigits.length >= 2 && gridsWithData >= 2) repeatSignalStrength = 'moderate';
  else if (hotDigits.length >= 1) repeatSignalStrength = 'weak';

  const seeds = [...history.slice(0, 5)];
  if (markedDigits.length > 0) {
    seeds.push(markedDigits.slice(0, 4).join(''));
  }
  const suggestedFamilies = mergeFamilies(seeds, 10);

  return {
    gridsWithData,
    digitGridCounts,
    hotDigits,
    markedDigits,
    repeatSignalStrength,
    suggestedFamilies,
  };
}

export function formatPatternScanForAI(
  scan: GridPatternScan,
  anchors: { red: number[]; blue: number[] },
  history: string[] = [],
): string {
  const lines: string[] = [
    'ORACLE PATTERN SCAN (computed from live grids — use this before guessing):',
    `- Grids with data: ${scan.gridsWithData}`,
    `- Repeat signal: ${scan.repeatSignalStrength} (digits repeating across most grids = strongest evening hint in The Oracle's Book)`,
    `- Hot digits (appear on many grids): ${scan.hotDigits.join(', ') || 'none yet'}`,
    `- Marked-tool digits: ${scan.markedDigits.join(', ') || 'none'}`,
    `- Today's RED anchors: ${anchors.red.join(', ')} | BLUE: ${anchors.blue.join(', ')}`,
    `- Anchor rule: pairs rotate +1 each calendar day — use TODAY's anchors only.`,
    `- Recent memory bank winners: ${history.slice(0, 12).join(', ') || 'none'}`,
    `- Pattern families to prefer (not one lonely number): ${scan.suggestedFamilies.join(', ') || 'enter digits and marks first'}`,
    'Pick predictions FROM this scan — digits that repeat across grids, touch prior winners, and fit anchor transforms (e.g. 1↔6 via blue pair). Say Probaly; never guarantee.',
  ];
  return lines.join('\n');
}
