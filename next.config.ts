import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  // Allow HMR and dev resources to be requested from 127.0.0.1 as well as localhost
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
