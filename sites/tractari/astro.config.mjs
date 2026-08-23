// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (e.g. http://HOST/tractari).
  // Override at build time with PUBLIC_BASE=/tractari; defaults to "/" for local dev.
  base: process.env.PUBLIC_BASE ?? "/",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    // @sites/kit ships TypeScript source; Vite must compile it for the
    // static build instead of externalizing it as a node_modules dep.
    ssr: { noExternal: ["@sites/kit"] },
    // three.js is large and non-tree-shakeable, but it is only imported inside
    // the `client:only` HeroCanvas island, so Astro/Rollup already emits it as
    // a separate lazy chunk fetched on mount — no manualChunks needed.
  },
});
