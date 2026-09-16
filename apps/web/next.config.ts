import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@saasfood/ui", "@saasfood/shared"],
  output: "standalone",
};

export default nextConfig;
