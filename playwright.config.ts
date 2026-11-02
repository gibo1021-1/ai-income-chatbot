import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  use: {
    baseURL: process.env.STATIC_PREVIEW
      ? "http://127.0.0.1:3000/ai-income-chatbot/"
      : "http://127.0.0.1:3000",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: process.env.STATIC_PREVIEW
      ? "python3 -m http.server 3000 --bind 127.0.0.1 --directory work/pages-preview"
      : "npm run start -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
