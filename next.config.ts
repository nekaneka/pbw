import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project – a stray lockfile in the user
  // profile folder otherwise confuses Next.js' workspace detection.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
