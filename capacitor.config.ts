import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android app loads your live site (Vercel). Updates on the website appear in the app
 * after refresh — no Play Store update needed for most changes.
 *
 * Build: npm run android:sync → open Android Studio → Generate signed AAB.
 */
const config: CapacitorConfig = {
  appId: 'com.theoraclepic4.app',
  appName: 'The Oracle Pic 4',
  webDir: 'mobile/web',
  server: {
    url: 'https://theoraclepic4.com',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
