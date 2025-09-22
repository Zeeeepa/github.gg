/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["https://dev.github.gg", "dev.github.gg"],
  transpilePackages: ["@lantos1618/better-ui"],
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
