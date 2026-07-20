const path = require("path");
const { loadEnvConfig } = require("@next/env");

// Загружаем .env из корня монорепозитория (RADENIE.PRO/.env)
loadEnvConfig(path.join(__dirname, ".."));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

module.exports = nextConfig;
