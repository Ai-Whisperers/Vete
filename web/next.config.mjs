/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy
 * - Development: Allow 'unsafe-eval' for Next.js Fast Refresh and HMR
 * - Production: Strict CSP without eval
 */
const ContentSecurityPolicy = isDev
  ? `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://unpkg.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.tile.openstreetmap.org https://unpkg.com https://assets.ruralmakro.org https://www.4pets.com.py https://www.ruralcenter.com.py https://www.bayer.com https://*.cloudinary.com https://images.unsplash.com https://assets.petco.com https://www.royalcanin.com https://www.bd.com https://http2.mlstatic.com https://m.media-amazon.com https://cdn.shopify.com https://d36tnp772eyphs.cloudfront.net https://www.nexgard.com.ar https://s.turbifycdn.com https://cdn.awsli.com.br https://s7d9.scene7.com https://www.idexx.com https://www.bbraunusa.com https://www.purina.com.py https://purina.com.py;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org https://va.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io;
    frame-ancestors 'self';
  `
  : `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://unpkg.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.tile.openstreetmap.org https://unpkg.com https://assets.ruralmakro.org https://www.4pets.com.py https://www.ruralcenter.com.py https://www.bayer.com https://*.cloudinary.com https://images.unsplash.com https://assets.petco.com https://www.royalcanin.com https://www.bd.com https://http2.mlstatic.com https://m.media-amazon.com https://cdn.shopify.com https://d36tnp772eyphs.cloudfront.net https://www.nexgard.com.ar https://s.turbifycdn.com https://cdn.awsli.com.br https://s7d9.scene7.com https://www.idexx.com https://www.bbraunusa.com https://www.purina.com.py https://purina.com.py;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org https://va.vercel-scripts.com https://*.sentry.io https://*.ingest.sentry.io;
    frame-ancestors 'self';
  `;

/**
 * Security headers for all routes
 * ARCH-024: Add Security Headers
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

const nextConfig = {
  // Set workspace root to web directory to fix multiple lockfiles warning
  // This tells Next.js that the web directory is the root for output file tracing
  outputFileTracingRoot: __dirname,


  // TypeScript and ESLint settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack optimizations for better performance
  webpack: (config, { dev, isServer }) => {
    // Suppress known next-intl dynamic import parsing warnings
    // These warnings are harmless - the package uses dynamic imports that webpack can't statically analyze
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /next-intl/,
        message: /Parsing of .* for build dependencies failed/,
      },
      {
        message: /Serializing big strings/,
      },
    ];

    // Fix for Windows: use polling for file watching to avoid race conditions
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Only apply optimizations in production builds to avoid dev issues
    if (!dev && !isServer) {
      // Aggressive code splitting to reduce chunk sizes
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          maxSize: 512000, // 512KB max chunk size
          minSize: 100000, // 100KB min chunk size
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate store components into smaller chunks
            storeFilters: {
              test: /[\\/]store[\\/]filters[\\/]/,
              name: 'store-filters',
              chunks: 'all',
              priority: 30,
            },
            storeComponents: {
              test: /[\\/]store[\\/](enhanced-product-card|quick-view-modal)[\\/]/,
              name: 'store-cards',
              chunks: 'all',
              priority: 25,
            },
            // Core vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|lucide-react|clsx)[\\/]/,
              name: 'core-vendor',
              chunks: 'all',
              priority: 20,
            },
            // Supabase and other large libs
            dataLibs: {
              test: /[\\/]node_modules[\\/](@supabase|framer-motion|date-fns)[\\/]/,
              name: 'data-libs',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      };
    }

    return config;
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        pathname: '/storage/v1/object/**',
      },
      // Product image sources from seed data
      {
        protocol: 'https',
        hostname: 'assets.ruralmakro.org',
      },
      {
        protocol: 'https',
        hostname: 'www.4pets.com.py',
      },
      {
        protocol: 'https',
        hostname: 'www.ruralcenter.com.py',
      },
      {
        protocol: 'https',
        hostname: 'www.bayer.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.petco.com',
      },
      {
        protocol: 'https',
        hostname: 'www.royalcanin.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bd.com',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'd36tnp772eyphs.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'www.nexgard.com.ar',
      },
      // Additional CDNs for product images
      {
        protocol: 'https',
        hostname: 's.turbifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.awsli.com.br',
      },
      {
        protocol: 'https',
        hostname: 's7d9.scene7.com',
      },
      {
        protocol: 'https',
        hostname: 'www.idexx.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bbraunusa.com',
      },
      {
        protocol: 'https',
        hostname: 'www.purina.com.py',
      },
      {
        protocol: 'https',
        hostname: 'purina.com.py',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Redirects for deprecated routes
  async redirects() {
    return [
      // Redirect old dashboard to admin (if needed in future)
      // {
      //   source: '/:clinic/dashboard',
      //   destination: '/:clinic/admin/dashboard',
      //   permanent: false,
      // },
    ];
  },
};

// Wrap with Sentry for error tracking and source maps
const sentryWebpackPluginOptions = {
  // Sentry organization and project settings
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress source map upload logs in CI
  silent: !process.env.CI,

  // Upload source maps for better error tracking
  widenClientFileUpload: true,

  // Hide source maps from production bundle
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Enable automatic Vercel monitors if deployed on Vercel
  automaticVercelMonitors: true,
};

// Only wrap with Sentry if DSN is configured
const finalConfig = process.env.SENTRY_DSN
  ? withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions)
  : withNextIntl(nextConfig);

export default finalConfig;
