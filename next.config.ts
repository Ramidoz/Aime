import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [],
  transpilePackages: ["three"],
};

export default nextConfig;
