/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/auth", "@repo/config"],
};

module.exports = nextConfig;
