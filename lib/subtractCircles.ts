/**
 * Oracle anchor pairs — two circles above "Enter 4 Digits" + same digits get
 * red/blue rings inside every grid cell.
 *
 * COLOR RULE (do not swap):
 *   • LEFT circle  = RED border/text   = digits **8** (top) and **3** (bottom).
 *   • RIGHT circle = BLUE border/text  = digits **9** (top) and **4** (bottom).
 *
 * These digits are fixed; changing the page calendar does not move them.
 */

export const SUBTRACT_CIRCLE_ANCHORS = {
  anchorRedTop: 8,
  anchorRedBottom: 3,
  anchorBlueTop: 9,
  anchorBlueBottom: 4,
} as const;

export type SubtractCircleAnchors = typeof SUBTRACT_CIRCLE_ANCHORS;

/** Date argument is ignored so anchors never shift grid positions. */
export function getSubtractCircleAnchors(_date?: Date): SubtractCircleAnchors {
  return { ...SUBTRACT_CIRCLE_ANCHORS };
}

/** Placeholder digits before mount (same as live anchors). */
export const SUBTRACT_CIRCLE_MOUNT_FALLBACK = SUBTRACT_CIRCLE_ANCHORS;
