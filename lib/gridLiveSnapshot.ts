import { formatMarkedCellsForAI, type GridDataMap, type GridMarkedCells } from '@/lib/gridMarkColors';
import type { GridPageTier } from '@/lib/gridMarkMemory';

export type GridLiveSnapshot = {
  markedCells: GridMarkedCells;
  gridData: GridDataMap;
  pageTier?: GridPageTier;
  inputs?: string[];
  selectedMarkColor?: string | null;
};

let liveSnapshot: GridLiveSnapshot | null = null;

export function setGridLiveSnapshot(snapshot: GridLiveSnapshot | null) {
  liveSnapshot = snapshot;
}

export function getGridLiveSnapshot(): GridLiveSnapshot | null {
  return liveSnapshot;
}

export function buildMarkedCellsConnectionBlock(): string {
  const snap = getGridLiveSnapshot();
  if (!snap) {
    return '\n\nLIVE MARKING TOOL: User is not on an active grid page, or no grid data synced yet.';
  }

  const formatted = formatMarkedCellsForAI(snap.markedCells, snap.gridData);

  return (
    '\n\nLIVE MARKING TOOL (colors on grid cells right now):\n' +
    'Members mark cells with yellow, turquoise, orange, or purple to note winning numbers or pattern hints.\n' +
    `${formatted}\n` +
    'When they mention colors or marks, use this live data. Treat marks as their notes for guess-work pattern play only.'
  );
}

export function buildLiveGridActivityBlock(): string {
  const snap = getGridLiveSnapshot();
  if (!snap) {
    return '\n\nLIVE GRID ACTIVITY: Not on a grid page — no Enter 4 Digits or marks synced.';
  }

  const tier = snap.pageTier ?? 'unknown';
  const inputs = snap.inputs ?? [];
  const filled = inputs
    .map((value, index) => ({ pair: index + 1, value: value.trim() }))
    .filter(({ value }) => /^\d{4}$/.test(value));

  const gridIds = Object.keys(snap.gridData);
  const markCounts = gridIds.map((gridId) => {
    const count = Object.keys(snap.markedCells[gridId] ?? {}).length;
    return count > 0 ? `${gridId}: ${count} mark(s)` : null;
  }).filter(Boolean);

  const lines = [
    `- Page tier: ${tier}`,
    `- Grids on screen: ${gridIds.length} (${gridIds.join(', ')})`,
    `- Enter 4 Digits filled: ${
      filled.length > 0
        ? filled.map(({ pair, value }) => `pair ${pair} = ${value}`).join('; ')
        : 'none yet'
    }`,
    `- Active marking color: ${snap.selectedMarkColor ?? 'none selected'}`,
    `- Marked grids: ${markCounts.length > 0 ? markCounts.join('; ') : 'none yet'}`,
  ];

  return (
    '\n\nLIVE GRID ACTIVITY (everything the member is doing right now):\n' +
    `${lines.join('\n')}\n` +
    'Use this to recognize their current session — digits entered, colors chosen, and which grids have marks.'
  );
}

export function buildFullLiveGridContextBlock(): string {
  return `${buildLiveGridActivityBlock()}${buildMarkedCellsConnectionBlock()}`;
}
