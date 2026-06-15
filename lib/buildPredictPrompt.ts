import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import { formatMarkedCellsForAI } from '@/lib/gridMarkColors';
import { compactGridDataForPrompt } from '@/lib/gridPrompt';
import { formatPatternScanForAI, scanGridPatterns } from '@/lib/gridPatternScan';

type BuildPredictPromptArgs = {
  gridData: GridDataMap;
  markedCells: GridMarkedCells;
  anchors: { red: number[]; blue: number[] };
  maxPredictions: number;
  history?: string[];
  memoryBank?: string;
};

/** Prediction prompt grounded in live grid scan — not numbers from the blue sky. */
export function buildPredictPrompt({
  gridData,
  markedCells,
  anchors,
  maxPredictions,
  history = [],
  memoryBank = '',
}: BuildPredictPromptArgs): string {
  const scan = scanGridPatterns(gridData, markedCells, history);
  const patternBlock = formatPatternScanForAI(scan, anchors, history);
  const marks = formatMarkedCellsForAI(markedCells, gridData);
  const grids = compactGridDataForPrompt(gridData, {
    maxGrids: maxPredictions > 5 ? 12 : 6,
    markedCells,
  });

  return (
    `Pick-4 Oracle pattern assistant. Guess work and entertainment only. Use "Probaly" in every reason. Never guarantee wins.\n\n` +
    `${patternBlock}\n\n` +
    `Marked cells:\n${marks}\n` +
    (memoryBank ? `${memoryBank}\n` : '') +
    `Grids:\n${grids}\n\n` +
    `Return JSON array only with exactly ${maxPredictions} objects: {"number":"1234","reason":"..."}\n` +
    `Each number MUST lean on the ORACLE PATTERN SCAN (hot repeating digits, pattern families, anchors, memory bank) — not random picks.\n` +
    `Prefer pattern families (e.g. if 1972 fits the scan, also consider 6972/7269/1927). Each reason must include Probaly and humble guess-work tone.`
  );
}
