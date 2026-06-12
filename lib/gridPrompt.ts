import type { GridDataMap } from '@/lib/gridMarkColors';

/** Compact grid text for AI prompts — smaller and faster than full JSON (important on 20-grid yearly). */
export function compactGridDataForPrompt(gridData: GridDataMap): string {
  const lines: string[] = [];

  for (const [gridId, values] of Object.entries(gridData)) {
    if (!values?.some((v) => v !== null)) continue;
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
