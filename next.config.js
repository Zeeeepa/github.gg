/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js to run on port 3001 to match GitHub App webhook configuration
  serverExternalPackages: ['@octokit/app', '@octokit/rest', '@octokit/webhooks'],
  
  // Disable strict linting during build for faster development
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript strict checking during build for faster development
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable static generation for pages that require database access
  output: 'standalone',
  
  // Environment variables that should be available on the client side
  env: {
    CUSTOM_PORT: '3001',
  },
  
  // Webpack configuration for handling GitHub App private keys
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle private key loading on server side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // Headers configuration for webhook handling
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, X-GitHub-Delivery, X-GitHub-Event, X-GitHub-Signature-256',
          },
        ],
      },
    ];
  },
  
  // Redirects for GitHub App installation flow
  async redirects() {
    return [
      {
        source: '/github/install',
        destination: '/install',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
