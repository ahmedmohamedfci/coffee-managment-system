import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone is for Linux/Docker images. Windows often cannot create the
  // required symlinks (EPERM), so keep it opt-in via DOCKER_BUILD=1.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  transpilePackages: ["@saasfood/ui", "@saasfood/shared"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
