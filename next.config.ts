import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Enable server components logging
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Image optimization
  images: {
    unoptimized: true, // Disable for Docker deployment
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
