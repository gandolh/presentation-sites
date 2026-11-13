import { defineConfig } from "@playwright/test";

// One dev server for the parish site, on a port of its own. Two projects: `churchix` at 390x844 with touch (the
// phone menu spec runs there) and `churchix-desktop` at 1280x800 with a mouse. The Floor specs run on both.
//
//   npx playwright test -c e2e                      everything
//   npx playwright test -c e2e --project churchix   the phone project only
const port = 4731;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: ".",
  workers: 1,
  reporter: "list",
  use: { baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
  projects: [
    { name: "churchix", metadata: { device: "phone" } },
    {
      name: "churchix-desktop",
      metadata: { device: "desktop" },
      use: { viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false },
    },
  ],
  webServer: {
    command: `npx astro dev --root ../apps/parohia-harlesti-bacau --port ${port} --host 127.0.0.1 --ignore-lock`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
