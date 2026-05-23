/**
 * Oracle anchor pairs — LEFT red circle, RIGHT blue circle.
 *
 * Day 0 (today on the grid calendar): RED 7 over 2, BLUE 8 over 3
 * Each +1 day on the picker: both pairs step up (8–3 red, 9–4 blue, …)
 */

export type SubtractCircleAnchors = {
  anchorRedTop: number;
  anchorRedBottom: number;
  anchorBlueTop: number;
  anchorBlueBottom: number;
};

/** Day-0 anchors — RED 7–2, BLUE 8–3 */
export const RED_ANCHOR_DAY_ZERO = { top: 7, bottom: 2 } as const;
export const BLUE_ANCHOR_DAY_ZERO = { top: 8, bottom: 3 } as const;

const BASE_ANCHORS: SubtractCircleAnchors = {
  anchorRedTop: RED_ANCHOR_DAY_ZERO.top,
  anchorRedBottom: RED_ANCHOR_DAY_ZERO.bottom,
  anchorBlueTop: BLUE_ANCHOR_DAY_ZERO.top,
  anchorBlueBottom: BLUE_ANCHOR_DAY_ZERO.bottom,
};

export const SUBTRACT_CIRCLE_ANCHORS = { ...BASE_ANCHORS };
export const SUBTRACT_CIRCLE_MOUNT_FALLBACK = { ...BASE_ANCHORS };

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mod10(n: number): number {
  return ((n % 10) + 10) % 10;
}

/** Days ahead of today (today = 0, tomorrow = 1). */
export function getAnchorDayOffset(date: Date = new Date()): number {
  const today = startOfLocalDay(new Date());
  const day = startOfLocalDay(date);
  const diff = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

export function getSubtractCircleAnchors(date: Date = new Date()): SubtractCircleAnchors {
  const steps = getAnchorDayOffset(date);
  return {
    anchorRedTop: mod10(BASE_ANCHORS.anchorRedTop + steps),
    anchorRedBottom: mod10(BASE_ANCHORS.anchorRedBottom + steps),
    anchorBlueTop: mod10(BASE_ANCHORS.anchorBlueTop + steps),
    anchorBlueBottom: mod10(BASE_ANCHORS.anchorBlueBottom + steps),
  };
}

export function formatAnchorLegend(anchors: SubtractCircleAnchors): {
  red: string;
  blue: string;
} {
  return {
    red: `${anchors.anchorRedTop}–${anchors.anchorRedBottom} = RED`,
    blue: `${anchors.anchorBlueTop}–${anchors.anchorBlueBottom} = BLUE`,
  };
}
