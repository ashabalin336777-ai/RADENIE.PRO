const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");

// Локально подтягиваем корневой .env; в Docker-контексте родителя нет — пропускаем
const rootDir = path.join(__dirname, "..");
if (
  fs.existsSync(path.join(rootDir, ".env")) ||
  fs.existsSync(path.join(rootDir, ".env.local"))
) {
  loadEnvConfig(rootDir);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: process.env.DOCKER_BUILD === "1",
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    workerThreads: false,
    cpus: 1,
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
};

module.exports = nextConfig;
