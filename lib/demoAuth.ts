function cleanEnv(value: string | undefined): string {
  return (value?.trim() || '').replace(/^["']|["']$/g, '');
}

export const DEMO_LOGIN_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED !== 'false';

/** Server-only — never expose owner demo credentials in the client bundle. */
export function getDemoEmailServer(): string {
  return cleanEnv(process.env.DEMO_EMAIL) || cleanEnv(process.env.NEXT_PUBLIC_DEMO_EMAIL);
}

export function getDemoPasswordServer(): string {
  return (
    cleanEnv(process.env.DEMO_PASSWORD) || cleanEnv(process.env.NEXT_PUBLIC_DEMO_PASSWORD)
  );
}

/** Public tester demo — 4 grids (2 pairs); shareable link; no 10- or 20-grid tiers. */
export const TESTER_DEMO_GRID_COUNT = 4;

export const GRID2_DEMO_PATH = '/demo/grid2';

export const GRID2_DEMO_ENABLED =
  process.env.NEXT_PUBLIC_GRID2_DEMO_ENABLED !== 'false';

/** Server-only tester demo email (for login API). */
export function getGrid2DemoEmailServer(): string {
  return cleanEnv(process.env.GRID2_DEMO_EMAIL) ||
    cleanEnv(process.env.NEXT_PUBLIC_GRID2_DEMO_EMAIL);
}

/** Server-only password — never ship demo passwords to the browser. */
export function getGrid2DemoPasswordServer(): string {
  return (
    cleanEnv(process.env.GRID2_DEMO_PASSWORD) ||
    cleanEnv(process.env.NEXT_PUBLIC_GRID2_DEMO_PASSWORD)
  );
}

/** Client-side tester banner — compares against env only (no hardcoded email). */
export function isGrid2DemoEmail(email: string | null | undefined): boolean {
  const demoEmail = cleanEnv(process.env.NEXT_PUBLIC_GRID2_DEMO_EMAIL);
  return !!email && !!demoEmail && email.toLowerCase() === demoEmail.toLowerCase();
}

/** Full public URL for ads and Play Console testing links. */
export function getGrid2DemoUrl(origin?: string): string {
  const base =
    origin?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://theoraclepic4.com';
  return `${base.replace(/\/$/, '')}${GRID2_DEMO_PATH}`;
}
