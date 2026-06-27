import Script from 'next/script';
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense';

/** Loads on every page via root layout — Google Auto ads. */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={ADSENSE_SCRIPT_SRC}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
