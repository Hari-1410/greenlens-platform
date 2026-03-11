/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
