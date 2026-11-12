import { defineConfig } from "@playwright/test";

// One dev server for the parish site, on a port of its own; the phone-menu spec runs against it on a
// phone-sized, touch-enabled screen.
const port = 4731;

export default defineConfig({
  testDir: ".",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  },
  webServer: {
    command: `npx astro dev --root ../apps/parohia-harlesti-bacau --port ${port} --host 127.0.0.1 --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
