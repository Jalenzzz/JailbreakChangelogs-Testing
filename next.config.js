const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@heroicons/react', 'react-icons'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**",
        pathname: "/guild-tag-badges/**",
      },
      {
        protocol: "https",
        hostname: "assets.jailbreakchangelogs.xyz",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**/AvatarHeadshot/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**/Avatar/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**/AvatarBust/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        pathname: "/**/AvatarFullBody/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/apple-touch-icon.png",
        destination:
          "https://assets.jailbreakchangelogs.xyz/assets/logos/apple-touch-icon.png",
      },
      { source: "/api/:path*", destination: "/api/:path*" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
          {
            key: "X-Built-By",
            value: "jalenzz",
          },
        ],
      },
      {
        source: "/users",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
