import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@saasfood/ui", "@saasfood/shared", "@saasfood/db"],
  output: "standalone",
  async redirects() {
    return [
      { source: "/pos", destination: "/demo/pos", permanent: false },
      { source: "/pos/:path*", destination: "/demo/pos/:path*", permanent: false },
      { source: "/admin", destination: "/demo/admin", permanent: false },
      { source: "/admin/:path*", destination: "/demo/admin/:path*", permanent: false },
      { source: "/kitchen-display", destination: "/demo/kitchen-display", permanent: false },
      { source: "/kitchen-display/:path*", destination: "/demo/kitchen-display/:path*", permanent: false },
      { source: "/kds", destination: "/demo/kitchen-display", permanent: false },
      { source: "/kds/:path*", destination: "/demo/kitchen-display/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
