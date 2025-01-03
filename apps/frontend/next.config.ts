import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Set the desired limit, e.g., 10 MB
    },
  },
  /* config options here */
};

export default nextConfig;

