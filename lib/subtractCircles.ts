/**
 * Oracle anchor pairs — two circles above "Enter 4 Digits" + same digits get
 * red/blue rings inside every grid cell.
 *
 * COLOR RULE (do not swap):
 *   • LEFT circle  = RED border/text   = digits **3** (top) and **8** (bottom).
 *   • RIGHT circle = BLUE border/text  = digits **4** (top) and **9** (bottom).
 *
 * These digits are fixed; changing the page calendar does not move them.
 */

export const SUBTRACT_CIRCLE_ANCHORS = {
  anchorRedTop: 3,
  anchorRedBottom: 8,
  anchorBlueTop: 4,
  anchorBlueBottom: 9,
} as const;

export type SubtractCircleAnchors = typeof SUBTRACT_CIRCLE_ANCHORS;

/** Date argument is ignored so anchors never shift grid positions. */
export function getSubtractCircleAnchors(_date?: Date): SubtractCircleAnchors {
  return { ...SUBTRACT_CIRCLE_ANCHORS };
}

/** Placeholder digits before mount (same as live anchors). */
export const SUBTRACT_CIRCLE_MOUNT_FALLBACK = SUBTRACT_CIRCLE_ANCHORS;
