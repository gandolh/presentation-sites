import { defineConfig } from "@playwright/test";

// One dev server per site, each on its own port; the phone-menu spec runs
// against all four.
const sites = [
  { name: "auto-service", port: 4701 },
  { name: "saloon", port: 4702 },
  { name: "subcort", port: 4703 },
  { name: "tractari", port: 4704 },
];

export default defineConfig({
  testDir: ".",
  workers: 1,
  reporter: "list",
  use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
  projects: sites.map(({ name, port }) => ({
    name,
    use: { baseURL: `http://localhost:${port}` },
  })),
  webServer: sites.map(({ name, port }) => ({
    command: `npx astro dev --root ../sites/${name} --port ${port} --host 127.0.0.1 --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  })),
});
