import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Independent static site for one parish. No shared runtime.
//
// Tailwind v4 is wired via the @tailwindcss/vite plugin (build-time, not the CDN).
// The global stylesheet `src/styles/app.css` imports Tailwind + the shared
// @churchix/ui M3 theme; it is injected into every page so library + app classes
// (and the Ecclesia Digitalis tokens) are present on every route.
//
// BASE_PATH: when this parish is served under a sub-path on the shared VPS
// (e.g. http://<ip>/parohia-harlesti-bacau/), Astro must emit asset URLs under
// that prefix. deploy.sh sets BASE_PATH=/parohia-harlesti-bacau for the build.
// Left unset for local dev/preview and for the eventual root domain deploy.
const base = process.env.BASE_PATH || undefined;

export default defineConfig({
  site: 'https://parohia-harlesti.ro',
  base,
  integrations: [
    react(),
    {
      name: 'churchix-global-styles',
      hooks: {
        'astro:config:setup': ({ injectScript }) => {
          injectScript('page-ssr', `import '/src/styles/app.css';`);
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
