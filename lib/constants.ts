export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'homeonline23@gmail.com';

/**
 * Navbar / broad sections: wider column (`max-w-4xl`).
 * Grid tier buttons intentionally use {@link VIDEO_SHELL} so they line up with hero + framed windows (`max-w-3xl`).
 */
export const CONTENT_SHELL = 'w-full max-w-4xl mx-auto px-2 md:px-6';

/** Hero oracle video + auxiliary videos + 2/10/20 Grids Boxes row — same width as main content windows. */
export const VIDEO_SHELL = 'w-full max-w-3xl mx-auto px-2 md:px-6';

/**
 * Outer frame for primary “window” panels site-wide — medium blue border + soft blue outer glow
 * (replaces legacy red chrome). Pair with `bg-slate-900/20 backdrop-blur-sm` etc. on the same node.
 */
export const WINDOW_OUTER_SHELL =
  'border-2 border-blue-600/[0.78] shadow-[0_0_0_1px_rgba(147,197,253,0.22),0_0_32px_rgba(37,99,235,0.42),0_0_52px_rgba(30,64,175,0.2),0_12px_40px_rgba(0,0,0,0.52)]';

/** Same look with a single border on narrow viewports (e.g. Evidence). */
export const WINDOW_OUTER_SHELL_RESPONSIVE =
  'border border-blue-600/72 md:border-2 md:border-blue-600/[0.78] shadow-[0_0_0_1px_rgba(147,197,253,0.18),0_0_28px_rgba(37,99,235,0.4),0_0_48px_rgba(30,64,175,0.18),0_10px_36px_rgba(0,0,0,0.5)]';

/** Inner framed media blocks (e.g. promo tile) — blue rim + subtle glow. */
export const WINDOW_INNER_FRAME =
  'border border-blue-500/45 shadow-[0_0_24px_rgba(37,99,235,0.28),0_14px_48px_rgba(0,0,0,0.5)] ring-1 ring-blue-400/20';

/** Same border + outer glow as {@link WINDOW_OUTER_SHELL}, plus soft inset wash for top bars. */
export const NAV_BAND_SHELL =
  'border-2 border-blue-600/[0.78] shadow-[0_0_0_1px_rgba(147,197,253,0.22),0_0_32px_rgba(37,99,235,0.42),0_0_52px_rgba(30,64,175,0.2),0_12px_40px_rgba(0,0,0,0.52),inset_0_0_36px_rgba(220,38,38,0.12),inset_0_0_36px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]';

/**
 * Top bar interior: **vertical** deep **midnight blue** base (no black — matches header “window” chrome) +
 * **horizontal** red → white → blue wash (inverse of the B–W–R stripe).
 */
export const NAV_BAND_FILL =
  'bg-[linear-gradient(90deg,rgba(220,38,38,0.5)_0%,rgba(255,255,255,0.26)_50%,rgba(37,99,235,0.5)_100%),linear-gradient(180deg,rgb(40,56,110)_0%,rgb(17,28,62)_50%,rgb(26,44,95)_100%)]';

/** Main hero video in `/public/` (encodeURIComponent handles spaces & hyphens). */
export const PUBLIC_ORACLE_HERO_VIDEO =
  '/' + encodeURIComponent('the-oracle-pic-4 predictor-1.mp4');

/** Robot clip `/robots-hero-h264.mp4` — e.g. admin dashboard feed preview (optional upload when unlocked). */
export const PUBLIC_ROBOT_ANALYSIS_VIDEO = '/robots-hero-h264.mp4';

/** `the system robot.png` — About architecture illustration and related UI. */
export const PUBLIC_THE_SYSTEM_ROBOT_IMAGE =
  '/' + encodeURIComponent('the system robot.png');

/** `The Oracle-1.png` — About page, above AI Analysis / Grid Engine cards. */
export const PUBLIC_THE_ORACLE_1_IMAGE =
  '/' + encodeURIComponent('The Oracle-1.png');

/** `The Oracle-2.png` — Process / how-it-works, above “How it Works”. */
export const PUBLIC_THE_ORACLE_2_IMAGE =
  '/' + encodeURIComponent('The Oracle-2.png');

/** Optional static hero for special pages — `public/upserving-the-worldglobe.png`. Pass as `heroImageSrc` on `PageHeader`; default hero remains oracle video. */
export const PUBLIC_EVIDENCE_HERO_IMAGE = '/upserving-the-worldglobe.png';

/** Same asset path as PUBLIC_EVIDENCE_HERO_IMAGE (worldglobe art), for optional image heroes. */
export const PUBLIC_SITE_HERO_IMAGE = PUBLIC_EVIDENCE_HERO_IMAGE;

/** Only Fast Login / ?oracle_key= mock mode — never paired with real Google JWT. Keeps refresh working. */
export const MOCK_OWNER_SESSION_KEY = 'oracle_fast_owner_mock';

/** Old key cleared on startup for real OAuth users (it used to force mock mode after Google sign-in). */
export const LEGACY_ADMIN_BYPASS_KEY = 'oracle_admin_bypass';
