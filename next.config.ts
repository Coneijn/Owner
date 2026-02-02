import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'ownerproduction.s3.amazonaws.com',
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ownerproduction.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;