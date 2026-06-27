import type { NextConfig } from 'next';

const config: NextConfig = {
  // ─── Image domains ──────────────────────────────────────────────────
  // Add any external image hosts here if you embed images in SVG responses
  images: {
    remotePatterns: [],
  },

  // ─── Headers ────────────────────────────────────────────────────────
  // GitHub caches README images aggressively.
  // s-maxage=300 means GitHub's CDN holds the image for 5 minutes before
  // re-fetching from Vercel. stale-while-revalidate lets it serve the old
  // version while it fetches the new one — zero visible lag for visitors.
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
          // Allow GitHub's markdown renderer to embed the SVG as an image
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default config;
