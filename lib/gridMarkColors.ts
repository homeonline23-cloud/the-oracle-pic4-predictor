export const GRID_MARK_COLORS = [
  { name: 'yellow', class: 'bg-yellow-300 border-yellow-500 border-2 shadow-[0_0_8px_rgba(234,179,8,0.3)]' },
  { name: 'turquoise', class: 'bg-teal-300 border-teal-500 border-2 shadow-[0_0_8px_rgba(20,184,166,0.3)]' },
  { name: 'orange', class: 'bg-orange-300 border-orange-500 border-2 shadow-[0_0_8px_rgba(249,115,22,0.3)]' },
  { name: 'purple', class: 'bg-purple-300 border-purple-500 border-2 shadow-[0_0_8px_rgba(168,85,247,0.3)]' },
] as const;

export type GridMarkColorName = (typeof GRID_MARK_COLORS)[number]['name'];

export function markClassToColorName(markClass: string): GridMarkColorName | 'unknown' {
  if (markClass.includes('yellow')) return 'yellow';
  if (markClass.includes('teal')) return 'turquoise';
  if (markClass.includes('orange')) return 'orange';
  if (markClass.includes('purple')) return 'purple';
  return 'unknown';
}

export type GridMarkedCells = Record<string, Record<number, string>>;
export type GridDataMap = Record<string, (string | null)[]>;

/** Human-readable list of marked cells for AI prompts (grid, digit, color). */
export function formatMarkedCellsForAI(
  markedCells: GridMarkedCells,
  gridData: GridDataMap,
): string {
  const lines: string[] = [];

  for (const [gridId, cells] of Object.entries(markedCells)) {
    const values = gridData[gridId];
    if (!values) continue;

    for (const [idxStr, markClass] of Object.entries(cells)) {
      if (!markClass) continue;
      const idx = Number(idxStr);
      const digit = values[idx];
      const color = markClassToColorName(markClass);
      const row = Math.floor(idx / 4) + 1;
      const col = (idx % 4) + 1;
      lines.push(
        `- ${gridId}: digit ${digit ?? '?'} at cell ${idx} (row ${row}, col ${col}), marked ${color}`,
      );
    }
  }

  if (lines.length === 0) {
    return 'No cells marked yet (Marking Tool: yellow, turquoise, orange, purple).';
  }

  const maxLines = 48;
  if (lines.length > maxLines) {
    const extra = lines.length - maxLines;
    return `${lines.slice(0, maxLines).join('\n')}\n- ... and ${extra} more marked cells (Yearly grid — use summary only).`;
  }

  return lines.join('\n');
}
