// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (/tavi). Override at build time with PUBLIC_BASE=/tavi; defaults to "/"
  // for local dev.
  base: process.env.PUBLIC_BASE ?? "/",
  // The origin the site is served from, for the canonical and og:url (see absoluteUrl in @sites/kit). The deploy
  // passes PUBLIC_SITE; repo text never names the real origin, so the fallback is a placeholder.
  site: process.env.PUBLIC_SITE ?? "https://example.com",
  integrations: [react()],
  // The dev toolbar is a keyboard tab stop after the footer, which the Floor focus check would report.
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
    // @sites/kit ships TypeScript source; Vite must compile it for the static build instead of externalizing it as
    // a node_modules dep.
    ssr: { noExternal: ["@sites/kit"] },
  },
});
