import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false, // Ensures React strict mode is enabled

  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
};

export default nextConfig;