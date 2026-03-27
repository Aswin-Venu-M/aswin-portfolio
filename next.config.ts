import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  generateBuildId: async () => null,
};

export default nextConfig;
