/** Owner/admin demo — full grid access. */
export const DEMO_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_EMAIL?.trim() || 'homeonline23@gmail.com';

export const DEMO_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim() || 'OracleDemo2026!';

export const DEMO_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED !== 'false';

/** Public 2-grid demo — shareable ad link; no access to 10- or 20-grid tiers. */
export const GRID2_DEMO_EMAIL =
  process.env.NEXT_PUBLIC_GRID2_DEMO_EMAIL?.trim() || 'try-grid2@theoraclepic4.com';

export const GRID2_DEMO_PASSWORD =
  process.env.NEXT_PUBLIC_GRID2_DEMO_PASSWORD?.trim() || 'TryGrid2Demo2026!';

export const GRID2_DEMO_PATH = '/demo/grid2';

export const GRID2_DEMO_ENABLED =
  process.env.NEXT_PUBLIC_GRID2_DEMO_ENABLED !== 'false';

export function isGrid2DemoEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === GRID2_DEMO_EMAIL.toLowerCase();
}

/** Full public URL for ads and Play Console testing links. */
export function getGrid2DemoUrl(origin?: string): string {
  const base =
    origin?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://theoraclepic4.com';
  return `${base.replace(/\/$/, '')}${GRID2_DEMO_PATH}`;
}
