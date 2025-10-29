import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
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
