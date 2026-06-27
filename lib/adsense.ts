/** Google AdSense publisher ID — set NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT on Vercel if needed. */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim() || 'ca-pub-2181194415627859';

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
