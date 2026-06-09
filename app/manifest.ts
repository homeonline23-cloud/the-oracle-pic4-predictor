import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Oracle Pic 4',
    short_name: 'Oracle Pic 4',
    description:
      'AI-powered Pick 4 grid analysis and pattern recognition. Smarter predictions, not guesswork.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#2563eb',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['entertainment', 'utilities'],
    icons: [
      {
        src: '/logo-pic4-modified.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-pic4-modified.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
