import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';

/** Compact grid text for AI prompts — smaller and faster than full JSON (important on 20-grid yearly). */
export function compactGridDataForPrompt(
  gridData: GridDataMap,
  options?: { maxGrids?: number; markedCells?: GridMarkedCells },
): string {
  const filled = Object.entries(gridData).filter(([, values]) => values?.some((v) => v !== null));

  let selected = filled;
  if (options?.maxGrids && filled.length > options.maxGrids) {
    const markedIds = new Set(
      Object.entries(options.markedCells ?? {})
        .filter(([, cells]) => Object.values(cells).some(Boolean))
        .map(([id]) => id),
    );
    selected = filled.filter(([id], i) => markedIds.has(id) || i < options.maxGrids!);
    if (selected.length > options.maxGrids) {
      selected = selected.slice(0, options.maxGrids);
    }
  }

  const lines: string[] = [];

  for (const [gridId, values] of selected) {
    if (!values) continue;
    const rows = [0, 1, 2, 3].map((row) =>
      values
        .slice(row * 4, row * 4 + 4)
        .map((v) => v ?? '·')
        .join(' '),
    );
    lines.push(`${gridId}:\n  ${rows.join('\n  ')}`);
  }

  if (lines.length === 0) return 'No grid digits entered yet.';
  return lines.join('\n');
}
