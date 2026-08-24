// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (e.g. http://HOST/design-study).
  // Override at build time with PUBLIC_BASE=/design-study; defaults to "/" for
  // local dev.
  base: process.env.PUBLIC_BASE ?? "/",
  integrations: [react()],

  // 14 themes x (1 feed + 12 posts) + the gallery. Every page is static.
  build: { format: "directory" },

  // NOTE: no Tailwind here, unlike the sibling sites. This one is fourteen
  // hand-authored visual systems with no shared utility vocabulary between
  // them, and Tailwind's preflight actively fights the Brutalism theme, whose
  // entire position is "browser defaults, untouched". Plain CSS per theme.
  vite: {
    // @sites/kit ships TypeScript source; Vite must compile it for the
    // static build instead of externalizing it as a node_modules dep.
    ssr: { noExternal: ["@sites/kit"] },
    // three.js is only imported inside the spatial theme's `client:only`
    // carousel island, so Rollup already emits it as a separate lazy chunk
    // that the other 13 themes never fetch — no manualChunks needed.
  },
});
