import type { NextConfig } from "next";
const basePath =
  process.env.GITHUB_PAGES === "true" ? "/ai-income-chatbot" : "";
const config: NextConfig = {
  output: process.env.GITHUB_PAGES === "true" ? "export" : undefined,
  basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
};
export default config;
