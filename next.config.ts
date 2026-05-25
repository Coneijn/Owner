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
  async redirects() {
    return [
      {
        // 1. /propiedades/1005-Marlin-Memphis?lang=es -> /propiedades/1005-marlin-memphis-tn-38116?lang=en
        source: '/propiedades/1005-Marlin-Memphis',
        has: [
          {
            type: 'query',
            key: 'lang',
            value: 'es',
          },
        ],
        destination: '/propiedades/1005-marlin-memphis-tn-38116?lang=en',
        permanent: true,
      },
      {
        // 2. /propiedades/6507- -> /
        source: '/propiedades/6507-',
        destination: '/',
        permanent: true,
      },
      {
        // 3. /propiedades/1005-marlin-memphis -> /propiedades/1005-marlin-memphis-tn-38116?lang=en
        source: '/propiedades/1005-marlin-memphis',
        destination: '/propiedades/1005-marlin-memphis-tn-38116?lang=en',
        permanent: true,
      },
      {
        // 4. /propiedades/3829-Leven-Cove?lang=es -> /
        source: '/propiedades/3829-Leven-Cove',
        has: [
          {
            type: 'query',
            key: 'lang',
            value: 'es',
          },
        ],
        destination: '/',
        permanent: true,
      },
      {
        // 5. /& -> /
        source: '/&',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;