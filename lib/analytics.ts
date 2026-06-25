/** Public GA4 measurement ID — also set NEXT_PUBLIC_GA_MEASUREMENT_ID on Vercel. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-R831CB5X7N';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
}
