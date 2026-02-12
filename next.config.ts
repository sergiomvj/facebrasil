import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

const nextConfig = {
  output: 'standalone' as const,
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https' as const,
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
