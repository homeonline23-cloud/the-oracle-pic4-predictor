/**
 * Date-based subtraction pairs for the grids. Internal base math is unchanged
 * (matches prior page-local implementations).
 *
 * UI / grid anchors:
 * - Red circle: the former "blue" pair (top2 → bottom2, mirror preserved by formula).
 * - Blue circle: same pair + 1 mod 10 on both digits ("next step").
 */

const SUBTRACT_ANCHOR_DATE = new Date(2026, 3, 3); // April 3, 2026

export function getDynamicNumbers(date: Date) {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = targetDate.getTime() - SUBTRACT_ANCHOR_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let t1 = (6 + diffDays) % 10;
  let t2 = (7 + diffDays) % 10;
  if (t1 < 0) t1 += 10;
  if (t2 < 0) t2 += 10;

  const b1 = (t1 + 5) % 10;
  const b2 = (t2 + 5) % 10;

  if (t2 === 0 && b2 === 5) {
    return { top1: 0, bottom1: 5, top2: 1, bottom2: 6 };
  }

  return { top1: t1, bottom1: b1, top2: t2, bottom2: b2 };
}

/** Values shown in red/blue circles and passed to grids + AI as anchor numbers. */
export function getSubtractCircleAnchors(date: Date) {
  const { top2, bottom2 } = getDynamicNumbers(date);
  return {
    anchorRedTop: top2,
    anchorRedBottom: bottom2,
    anchorBlueTop: (top2 + 1) % 10,
    anchorBlueBottom: (bottom2 + 1) % 10,
  };
}

/** Placeholder digits before mount (matches anchor date April 3, 2026). */
export const SUBTRACT_CIRCLE_MOUNT_FALLBACK = {
  anchorRedTop: 7,
  anchorRedBottom: 2,
  anchorBlueTop: 8,
  anchorBlueBottom: 3,
} as const;
