'use client';

import { useEffect, useState } from 'react';

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
