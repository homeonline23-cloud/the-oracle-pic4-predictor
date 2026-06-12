import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import { formatMarkedCellsForAI } from '@/lib/gridMarkColors';
import { compactGridDataForPrompt } from '@/lib/gridPrompt';

type BuildPredictPromptArgs = {
  gridData: GridDataMap;
  markedCells: GridMarkedCells;
  anchors: { red: number[]; blue: number[] };
  maxPredictions: number;
  history?: string[];
  memoryBank?: string;
};

/** Shorter prompt = faster Gemini response (important on Basic/Premium/Yearly). */
export function buildPredictPrompt({
  gridData,
  markedCells,
  anchors,
  maxPredictions,
  history = [],
  memoryBank = '',
}: BuildPredictPromptArgs): string {
  const marks = formatMarkedCellsForAI(markedCells, gridData);
  const grids = compactGridDataForPrompt(gridData, {
    maxGrids: maxPredictions > 5 ? 8 : 4,
    markedCells,
  });

  return (
    `Pick-4 pattern assistant. Guess work and entertainment only. Use "Probaly" in every reason. Never guarantee wins.\n\n` +
    `RED anchors: ${anchors.red.join(', ')} | BLUE anchors: ${anchors.blue.join(', ')}\n` +
    `Recent winners: ${history.slice(0, 15).join(', ') || 'none yet'}\n` +
    `Marked cells:\n${marks}\n` +
    (memoryBank ? `${memoryBank}\n` : '') +
    `Grids:\n${grids}\n\n` +
    `Return JSON array only with exactly ${maxPredictions} objects: {"number":"1234","reason":"..."} ` +
    `Each reason must include Probaly and humble guess-work tone.`
  );
}
