import preset from "./vendor/house-style/knip.json" with { type: "json" };

// knip has no `extends`, so this spreads the house preset and adds what knip can't know about this project.
export default {
  ...preset,
  // The Docusaurus docs site is its own project with its own checks.
  ignoreWorkspaces: ["docs-site"],
  workspaces: {
    // Every church app lists the shared tsconfig package, though this one extends Astro's strict base.
    // The global stylesheet is injected by a string in astro.config.mjs, which knip can't follow.
    "apps/parohia-harlesti-bacau": { entry: ["src/styles/app.css"], ignoreDependencies: ["@churchix/config"] },
    // The shared tsconfig sets `jsxImportSource: "react"`, a package reference no import shows.
    // The Playwright config is read by `playwright test -c e2e`, which no import shows.
    ".": { entry: ["e2e/playwright.config.ts"], ignoreDependencies: ["react"] },
    // The components import `z` as a type only, and the version comes with @churchix/schemas. `vite/client`
    // is `types` in the tsconfig: Vite comes with Astro in each church app.
    "packages/ui": { ignoreDependencies: ["zod"], ignoreUnresolved: ["vite/client"] },
  },
};
