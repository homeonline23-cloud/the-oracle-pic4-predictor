import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import ScrollToTop from '@/components/ScrollToTop';
import OracleGuardian from '@/components/OracleGuardian';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Analytics } from '@/components/analytics/Analytics';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://theoraclepic4.com'),
  applicationName: 'The Oracle Pic 4',
  title: {
    default: 'The Oracle Pic 4',
    template: '%s — The Oracle Pic 4',
  },
  description:
    'The Oracle Pic 4 uses AI-powered grid analysis and historical pattern recognition to help you identify high-probability Pick 4 lottery combinations. Smarter predictions, not guesswork.',
  keywords: [
    'Pick 4 prediction',
    'Pic 4 AI',
    'lottery grid system',
    'Pick 4 strategy',
    'lottery pattern analysis',
    'AI lottery predictor',
    'cash 4',
    'daily 4',
    'play 4',
  ],
  icons: {
    icon: '/logo-pic4-modified.png',
    shortcut: '/logo-pic4-modified.png',
    apple: '/logo-pic4-modified.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://theoraclepic4.com',
    siteName: 'The Oracle Pic 4',
    title: 'The Oracle Pic 4',
    description:
      'AI-powered grid analysis and historical pattern recognition to identify high-probability Pick 4 lottery combinations. Smarter predictions, not guesswork.',
    images: [
      {
        url: '/The Oracle-1.png',
        width: 1200,
        height: 630,
        alt: 'The Oracle Pic 4 Predictor — AI-powered lottery grid analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Oracle Pic 4',
    description:
      'AI-powered grid analysis and pattern recognition for Pick 4 lottery combinations.',
    images: ['/The Oracle-1.png'],
  },
  alternates: {
    canonical: 'https://theoraclepic4.com',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full overflow-x-hidden overflow-y-auto font-sans text-slate-200">
        <Providers>
          <div className="relative min-h-screen w-full bg-transparent">
            {/* Dedicated Background Layer */}
            <div
              className="pointer-events-none fixed inset-0 z-[-1] bg-[#020617] bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.3), rgba(2, 6, 23, 0.6)), url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80')`,
              }}
              aria-hidden
            />
            {/* Background Texture Overlay — kept very light so text stays sharp */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04] bg-texture-carbon"></div>
            
            <Navbar />
            <div className="relative z-0 mt-[4.75rem] sm:mt-[5rem] md:mt-[5.25rem] shrink-0" aria-hidden="true" />
            
            <div className="relative z-10 w-full min-w-0">{children}</div>

            <Footer />
            <OracleGuardian />
            <ScrollToTop />
            <Analytics />
          </div>
        </Providers>
      </body>
    </html>
  );
}
