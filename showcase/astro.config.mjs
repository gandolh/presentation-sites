// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Served under a sub-path on a shared VPS (http://HOST/showcase).
  // Override at build time with PUBLIC_BASE=/showcase; defaults to "/" for local dev.
  base: process.env.PUBLIC_BASE ?? '/',

  vite: {
    plugins: [tailwindcss()],
  },
});
