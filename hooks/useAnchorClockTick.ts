'use client';

import { useEffect, useState } from 'react';
import { startOfLocalDay } from '@/lib/subtractCircles';

/** Re-render at each local midnight so anchor digits advance like a clock. */
export function useAnchorClockTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleMidnight = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timeoutId = window.setTimeout(() => {
        setTick((t) => t + 1);
        scheduleMidnight();
      }, next.getTime() - now.getTime());
    };

    scheduleMidnight();
    return () => clearTimeout(timeoutId);
  }, []);

  return tick;
}

/** Keep grid date on today when the clock ticks at midnight. */
export function useSyncGridDateAtMidnight(
  setSelectedDate: (d: Date) => void,
  setCurrentTime?: (d: Date) => void,
  anchorTick?: number
): void {
  useEffect(() => {
    const today = startOfLocalDay(new Date());
    setSelectedDate(today);
    setCurrentTime?.(new Date());
  }, [anchorTick, setSelectedDate, setCurrentTime]);
}
