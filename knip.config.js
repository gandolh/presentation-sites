import preset from "./vendor/house-style/knip.json" with { type: "json" };

// knip has no `extends`, so this spreads the house preset and adds what knip can't know about this repo.
export default {
  ...preset,
  ignore: [
    ...preset.ignore,
    // Npm projects with their own checks: Churchix, the saloon bots and the Docusaurus docs sites.
    "churchix/**",
    "sites/saloon/marketing/bots/**",
    "sites/*/docs-site/**",
    // Templates for the gitignored site.local.ts, which holds each business's real details.
    "sites/*/src/content/site.local.example.ts",
    // Kept on purpose with nothing importing them: the photo seam of two sites that ship no photography
    // yet, and the saloon's testimonials, parked until there are real client reviews.
    "sites/auto-service/src/content/images.ts",
    "sites/subcort/src/content/images.ts",
    "sites/saloon/src/components/Testimonials.astro",
    "sites/saloon/src/content/testimonials.ts",
  ],
  // The docs sites and design-study stay outside the harness.
  ignoreWorkspaces: ["sites/*/docs-site", "sites/design-study"],
  workspaces: {
    ".": { entry: ["scripts/*.{js,mjs,ts}", "e2e/playwright.config.ts"] },
    // astro-icon reads the Phosphor set (`ph:` names) from the installed package; nothing imports it.
    "sites/saloon": { ignoreDependencies: ["@iconify-json/ph"] },
    // `types: ["vite/client"]` in its tsconfig: Vite comes with Astro in each site that builds the kit.
    "packages/site-kit": { ignoreUnresolved: ["vite/client"] },
  },
};
