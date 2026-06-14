import type { SupabaseClient } from '@supabase/supabase-js';
import {
  markClassToColorName,
  type GridDataMap,
  type GridMarkedCells,
  type GridMarkColorName,
} from '@/lib/gridMarkColors';

export type GridPageTier = 'basic' | 'premium' | 'yearly';

export type GridMarkMemoryRow = {
  id: string;
  user_id: string;
  page_tier: GridPageTier;
  grid_id: string;
  cell_index: number;
  color_name: string;
  digit: string | null;
  created_at: string;
};

export type WinningNumberRow = {
  id: string;
  number: string;
  location: string;
  created_at: string;
};

/** Normalize JSON from Supabase (cell keys may be strings). */
export function normalizeMarkedCells(raw: unknown): GridMarkedCells {
  if (!raw || typeof raw !== 'object') return {};
  const out: GridMarkedCells = {};
  for (const [gridId, cells] of Object.entries(raw as Record<string, unknown>)) {
    if (!cells || typeof cells !== 'object') continue;
    out[gridId] = {};
    for (const [idxStr, markClass] of Object.entries(cells as Record<string, unknown>)) {
      if (typeof markClass === 'string' && markClass) {
        out[gridId][Number(idxStr)] = markClass;
      }
    }
  }
  return out;
}

export function diffNewMarks(
  prev: GridMarkedCells,
  next: GridMarkedCells,
): Array<{ gridId: string; cellIndex: number; markClass: string }> {
  const added: Array<{ gridId: string; cellIndex: number; markClass: string }> = [];

  for (const [gridId, cells] of Object.entries(next)) {
    for (const [idxStr, markClass] of Object.entries(cells)) {
      if (!markClass) continue;
      const cellIndex = Number(idxStr);
      if (prev[gridId]?.[cellIndex] !== markClass) {
        added.push({ gridId, cellIndex, markClass });
      }
    }
  }

  return added;
}

export function formatMarkMemoryRowsForAI(rows: GridMarkMemoryRow[]): string {
  if (rows.length === 0) {
    return 'No saved color-mark patterns in the memory bank yet.';
  }

  return rows
    .map((row) => {
      const when = new Date(row.created_at).toISOString().slice(0, 10);
      return `- ${row.grid_id}: digit ${row.digit ?? '?'}, ${row.color_name} mark (${row.page_tier}, saved ${when})`;
    })
    .join('\n');
}

export async function fetchRecentMarkMemory(
  supabase: SupabaseClient,
  limit = 40,
): Promise<GridMarkMemoryRow[]> {
  try {
    const { data, error } = await supabase
      .from('grid_mark_memory')
      .select('id, user_id, page_tier, grid_id, cell_index, color_name, digit, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('fetchRecentMarkMemory:', error.message);
      return [];
    }

    return (data ?? []) as GridMarkMemoryRow[];
  } catch (err) {
    console.error('fetchRecentMarkMemory:', err);
    return [];
  }
}

export async function fetchRecentWinningNumbers(
  supabase: SupabaseClient,
  limit = 30,
): Promise<WinningNumberRow[]> {
  try {
    const { data, error } = await supabase
      .from('winning_numbers')
      .select('id, number, location, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('fetchRecentWinningNumbers:', error.message);
      return [];
    }

    return (data ?? []) as WinningNumberRow[];
  } catch (err) {
    console.error('fetchRecentWinningNumbers:', err);
    return [];
  }
}

function formatWinningNumbersForAI(rows: WinningNumberRow[]): string {
  if (rows.length === 0) {
    return 'No winning numbers saved in the neural memory bank yet.';
  }

  return rows
    .map((row) => {
      const when = new Date(row.created_at).toISOString().slice(0, 10);
      return `- ${row.number} (${row.location}, saved ${when})`;
    })
    .join('\n');
}

export async function buildMarkMemoryBankBlock(supabase: SupabaseClient): Promise<string> {
  const [markRows, winningRows] = await Promise.all([
    fetchRecentMarkMemory(supabase),
    fetchRecentWinningNumbers(supabase),
  ]);

  return (
    '\n\nNEURAL MEMORY BANK:\n' +
    'WINNING NUMBERS (4-digit draws saved by members):\n' +
    `${formatWinningNumbersForAI(winningRows)}\n` +
    'COLOR-MARK PATTERNS (cells marked yellow/turquoise/orange/purple):\n' +
    `${formatMarkMemoryRowsForAI(markRows)}\n` +
    'Use these as historical pattern notes for guess-work analysis only. When the Oracle asks you to memorize/store a number, confirm it was saved to this bank.'
  );
}

export function buildMemoryInserts(
  userId: string,
  pageTier: GridPageTier,
  newMarks: Array<{ gridId: string; cellIndex: number; markClass: string }>,
  gridData: GridDataMap,
) {
  return newMarks
    .map(({ gridId, cellIndex, markClass }) => {
      const color = markClassToColorName(markClass);
      if (color === 'unknown') return null;
      const digit = gridData[gridId]?.[cellIndex] ?? null;
      return {
        user_id: userId,
        page_tier: pageTier,
        grid_id: gridId,
        cell_index: cellIndex,
        color_name: color as GridMarkColorName,
        digit: digit != null ? String(digit) : null,
      };
    })
    .filter(Boolean);
}
