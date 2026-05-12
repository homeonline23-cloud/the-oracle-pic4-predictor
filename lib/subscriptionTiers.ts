export type PaidTier = 'standard' | 'premium' | 'yearly';

export const TIER_LIMITS: Record<
  PaidTier,
  { predictions_limit: number; grids_limit: number; days: number }
> = {
  standard: { predictions_limit: 2, grids_limit: 2, days: 30 },
  premium: { predictions_limit: 5, grids_limit: 10, days: 30 },
  yearly: { predictions_limit: 10, grids_limit: 20, days: 365 },
};

export function isPaidTier(value: string): value is PaidTier {
  return value === 'standard' || value === 'premium' || value === 'yearly';
}
