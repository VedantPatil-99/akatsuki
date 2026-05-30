import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["puppeteer-core"],
  allowedDevOrigins: ["unwanted-blanching-coroner.ngrok-free.dev"],
  experimental: {
    // This forces Next.js to only bundle the specific icons you use
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
