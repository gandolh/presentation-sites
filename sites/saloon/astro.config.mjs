// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (e.g. http://HOST/saloon).
  // Override at build time with PUBLIC_BASE=/saloon; defaults to "/" for local dev.
  base: process.env.PUBLIC_BASE ?? '/',
  integrations: [
    react(),
    // Phosphor, inlined at build time by astro-icon: no runtime, no sprite
    // request, and one icon family across the site (see DESIGN.md). Only the
    // glyphs actually referenced end up in the HTML, so there is no `include`
    // allow-list to maintain.
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
    // @sites/kit ships TypeScript source; Vite must compile it for the
    // static build instead of externalizing it as a node_modules dep.
    ssr: { noExternal: ['@sites/kit'] }
  }
});