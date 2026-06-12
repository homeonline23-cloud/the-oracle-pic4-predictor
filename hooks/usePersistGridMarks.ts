'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GridDataMap, GridMarkedCells } from '@/lib/gridMarkColors';
import {
  buildMemoryInserts,
  diffNewMarks,
  normalizeMarkedCells,
  type GridPageTier,
} from '@/lib/gridMarkMemory';

const SAVE_DEBOUNCE_MS = 700;

type UsePersistGridMarksArgs = {
  pageTier: GridPageTier;
  markedCells: GridMarkedCells;
  setMarkedCells: React.Dispatch<React.SetStateAction<GridMarkedCells>>;
  gridData: GridDataMap;
  inputs?: string[];
  userId?: string | null;
};

/** Load marks on sign-in and auto-save snapshots + memory bank rows when cells are marked. */
export function usePersistGridMarks({
  pageTier,
  markedCells,
  setMarkedCells,
  gridData,
  inputs = [],
  userId,
}: UsePersistGridMarksArgs) {
  const supabase = createClient();
  const hydratedRef = useRef(false);
  const prevMarksRef = useRef<GridMarkedCells>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) {
      hydratedRef.current = false;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from('grid_mark_snapshots')
          .select('marked_cells')
          .eq('user_id', userId)
          .eq('page_tier', pageTier)
          .maybeSingle();

        if (cancelled) return;

        if (!error && data?.marked_cells) {
          const restored = normalizeMarkedCells(data.marked_cells);
          setMarkedCells(restored);
          prevMarksRef.current = restored;
        } else {
          prevMarksRef.current = {};
        }
      } catch (err) {
        console.error('Load grid marks error:', err);
      } finally {
        if (!cancelled) hydratedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per user + page
  }, [userId, pageTier]);

  useEffect(() => {
    if (!userId || !hydratedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        const newMarks = diffNewMarks(prevMarksRef.current, markedCells);

        try {
          const { error: snapshotError } = await supabase.from('grid_mark_snapshots').upsert(
            {
              user_id: userId,
              page_tier: pageTier,
              marked_cells: markedCells,
              inputs,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,page_tier' },
          );

          if (snapshotError) throw snapshotError;

          if (newMarks.length > 0) {
            const inserts = buildMemoryInserts(userId, pageTier, newMarks, gridData);
            if (inserts.length > 0) {
              const { error: memoryError } = await supabase
                .from('grid_mark_memory')
                .insert(inserts as NonNullable<(typeof inserts)[number]>[]);
              if (memoryError) throw memoryError;
            }
          }

          prevMarksRef.current = markedCells;
        } catch (err) {
          console.error('Auto-save grid marks error:', err);
        }
      })();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [markedCells, gridData, inputs, pageTier, supabase, userId]);
}
