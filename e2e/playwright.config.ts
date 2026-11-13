import { defineConfig } from "@playwright/test";

// One dev server per site, each on its own port. Every site runs two projects: `<site>` at 390x844 with touch
// (the phone menu spec runs there) and `<site>-desktop` at 1280x800 with a mouse. The Floor specs run on both.
//
//   SITES=auto-service npx playwright test -c e2e            only the named sites (comma list)
//   npx playwright test -c e2e --project auto-service        one project
const sites = [
  { name: "auto-service", port: 4701 },
  { name: "saloon", port: 4702 },
  { name: "subcort", port: 4703 },
  { name: "tractari", port: 4704 },
];
const wanted = process.env.SITES?.split(",") ?? sites.map((s) => s.name);
const chosen = sites.filter((s) => wanted.includes(s.name));

export default defineConfig({
  testDir: ".",
  workers: 1,
  reporter: "list",
  use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
  projects: chosen.flatMap(({ name, port }) => {
    const baseURL = `http://localhost:${port}`;
    return [
      { name, metadata: { site: name, device: "phone" }, use: { baseURL } },
      {
        name: `${name}-desktop`,
        metadata: { site: name, device: "desktop" },
        use: { baseURL, viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false },
      },
    ];
  }),
  webServer: chosen.map(({ name, port }) => ({
    command: `npx astro dev --root ../sites/${name} --port ${port} --host 127.0.0.1 --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  })),
});
