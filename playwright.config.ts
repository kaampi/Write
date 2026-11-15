import { defineConfig } from "@playwright/test";

const PORT = 4180;

/**
 * End-to-end checks of the core author flows, run in a real browser against
 * the production build (`npm run test:e2e`). Deliberately separate from
 * `npm test`: vitest has no DOM, and a browser run is slower and needs a
 * Chromium install (`npx playwright install chromium`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
    trace: "off"
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
