import { ADMIN_EMAIL } from '@/lib/constants';
import { isGrid2DemoEmail } from '@/lib/demoAuth';

export type GridTier = 'standard' | 'premium' | 'yearly';

export const GRID_ROUTE_TIERS: Record<string, GridTier> = {
  '/basic': 'standard',
  '/premium': 'premium',
  '/yearly': 'yearly',
};

const TIER_ORDER = ['free', 'standard', 'premium', 'yearly'] as const;

function adminEmailFromEnv(): string {
  const server = process.env.ADMIN_EMAIL?.trim();
  if (server) return server;
  return ADMIN_EMAIL.trim();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = adminEmailFromEnv();
  return !!email && !!admin && email.toLowerCase() === admin.toLowerCase();
}

export function hasPaidGridAccess(
  profile: {
    subscription_tier?: string | null;
    subscription_status?: string | null;
  } | null | undefined,
  requiredTier: GridTier,
  email?: string | null
): boolean {
  if (isAdminEmail(email)) return true;
  /** Public 2-grid demo — standard tier only, even if profiles row is missing. */
  if (isGrid2DemoEmail(email)) return requiredTier === 'standard';
  if (!profile || profile.subscription_status !== 'active') return false;

  const userIdx = TIER_ORDER.indexOf(
    (profile.subscription_tier || 'free') as (typeof TIER_ORDER)[number]
  );
  const requiredIdx = TIER_ORDER.indexOf(requiredTier);
  if (userIdx < 0 || requiredIdx < 0) return false;
  return userIdx >= requiredIdx;
}

export function getRequiredTierForPath(pathname: string): GridTier | null {
  return GRID_ROUTE_TIERS[pathname] ?? null;
}
