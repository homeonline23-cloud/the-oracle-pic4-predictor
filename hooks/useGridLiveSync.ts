'use client';

import { useEffect } from 'react';
import { setGridLiveSnapshot, type GridLiveSnapshot } from '@/lib/gridLiveSnapshot';
import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';

/** Keeps Oracle chat + AI in sync with marks and grid digits on grid pages. */
export function useGridLiveSync(
  markedCells: GridMarkedCells,
  gridData: GridDataMap,
) {
  useEffect(() => {
    const snapshot: GridLiveSnapshot = { markedCells, gridData };
    setGridLiveSnapshot(snapshot);
    return () => setGridLiveSnapshot(null);
  });
}
