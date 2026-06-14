/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Self-host (Namecheap Node, VPS, etc.): zip `.next/standalone` after build + copy `public` + `.next/static` — see README_DEPLOY_STANDALONE.txt */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'theoraclepic4.com' }],
        destination: 'https://www.theoraclepic4.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
