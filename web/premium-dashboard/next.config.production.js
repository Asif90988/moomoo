/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-specific configurations
  env: {
    NODE_ENV: 'production',
  },
  
  // Output configuration for standalone deployment
  output: 'standalone',
  
  // Disable telemetry in production
  telemetry: false,
  
  // Enable experimental features for production
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [],
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Image optimization
  images: {
    domains: [],
    unoptimized: true, // Disable if using external image optimizer
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: true,
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PAPER_TRADING_MODE: process.env.NEXT_PUBLIC_PAPER_TRADING_MODE,
  },
  
  // Webpack configuration for production
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production-specific webpack optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;