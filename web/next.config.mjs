/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy
 * - Development: Allow 'unsafe-eval' for Next.js Fast Refresh and HMR
 * - Production: Strict CSP without eval
 */
const ContentSecurityPolicy = isDev
  ? `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://assets.ruralmakro.org https://www.4pets.com.py https://www.ruralcenter.com.py https://www.bayer.com https://*.cloudinary.com https://images.unsplash.com https://assets.petco.com https://www.royalcanin.com https://www.bd.com;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-ancestors 'self';
  `
  : `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://assets.ruralmakro.org https://www.4pets.com.py https://www.ruralcenter.com.py https://www.bayer.com https://*.cloudinary.com https://images.unsplash.com https://assets.petco.com https://www.royalcanin.com https://www.bd.com;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
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
  // TypeScript and ESLint settings
  // TODO: Set to false once all type errors are fixed
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack optimizations for better performance
  webpack: (config, { dev, isServer }) => {
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

export default nextConfig;
