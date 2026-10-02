// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (e.g. http://HOST/auto-service).
  // Override at build time with PUBLIC_BASE=/auto-service; defaults to "/" for local dev.
  base: process.env.PUBLIC_BASE ?? '/',
  // The origin the site is served from, for canonical / og / JSON-LD URLs
  // (see absoluteUrl in @sites/kit). At launch on its own domain, build with
  // PUBLIC_SITE=https://<domain> PUBLIC_BASE=/.
  site: process.env.PUBLIC_SITE ?? 'https://gandolh.ro',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    // @sites/kit ships TypeScript source; Vite must compile it for the
    // static build instead of externalizing it as a node_modules dep.
    ssr: { noExternal: ['@sites/kit'] }
  }
});
