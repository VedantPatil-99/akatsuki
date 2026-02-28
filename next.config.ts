import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This forces Next.js to only bundle the specific icons you use
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  reactCompiler: true,
};

export default nextConfig;
