import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // sharp is a native module — must not be bundled by webpack
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Cache optimized images for 1 year in the CDN
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Cache static uploads if ever served locally (dev)
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
