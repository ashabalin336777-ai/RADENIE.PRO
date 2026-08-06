const path = require("path");
const { loadEnvConfig } = require("@next/env");

// Загружаем .env из корня монорепозитория (RADENIE.PRO/.env)
loadEnvConfig(path.join(__dirname, ".."));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // На слабом VPS eslint во время build съедает RAM и часто даёт exit 1 / OOM
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    // В Docker-сборке на 2GB не гоняем tsc второй раз (уже проверено локально/CI)
    ignoreBuildErrors: process.env.DOCKER_BUILD === "1",
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
