import { formatMarkedCellsForAI, type GridDataMap, type GridMarkedCells } from '@/lib/gridMarkColors';

export type GridLiveSnapshot = {
  markedCells: GridMarkedCells;
  gridData: GridDataMap;
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
