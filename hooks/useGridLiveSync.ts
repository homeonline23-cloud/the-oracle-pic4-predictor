'use client';

import { useEffect } from 'react';
import {
  setGridLiveSnapshot,
  type GridLiveSnapshot,
} from '@/lib/gridLiveSnapshot';
import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import type { GridPageTier } from '@/lib/gridMarkMemory';

type GridLiveSyncMeta = {
  pageTier?: GridPageTier;
  inputs?: string[];
  selectedMarkColor?: string | null;
};

/** Keeps Oracle chat + AI in sync with marks, digits, and grid activity. */
export function useGridLiveSync(
  markedCells: GridMarkedCells,
  gridData: GridDataMap,
  meta: GridLiveSyncMeta = {},
) {
  useEffect(() => {
    const snapshot: GridLiveSnapshot = {
      markedCells,
      gridData,
      pageTier: meta.pageTier,
      inputs: meta.inputs,
      selectedMarkColor: meta.selectedMarkColor,
    };
    setGridLiveSnapshot(snapshot);
    return () => setGridLiveSnapshot(null);
  });
}
