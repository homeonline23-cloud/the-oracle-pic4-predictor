export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'homeonline23@gmail.com';

/**
 * Navbar / broad sections: wider column (`max-w-4xl`).
 * Grid tier buttons intentionally use {@link VIDEO_SHELL} so they line up with hero + framed windows (`max-w-3xl`).
 */
export const CONTENT_SHELL = 'w-full max-w-4xl mx-auto px-2 md:px-6';

/** Hero oracle video + auxiliary videos + 2/10/20 Grids Boxes row — same width as main content windows. */
export const VIDEO_SHELL = 'w-full max-w-3xl mx-auto px-2 md:px-6';

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
