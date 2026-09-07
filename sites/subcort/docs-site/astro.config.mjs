// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

/**
 * Documentation for the Subcort presentation site.
 *
 * Every page under "The site" is RENDERED from the site's own markdown —
 * README.md, PRODUCT.md, DESIGN.md and anything under docs/ — by
 * scripts/sync-corpus.mjs. Those files are the working documents the site is
 * built from and they are maintained; copying them here would create a second
 * version that goes stale.
 *
 * Deployed at https://gandolh.ro/subcort/docs/.
 */
// The deployed base path, baked in rather than injected at deploy time.
//
// vps-deploy ships what this repo already built and VERIFIES this base — it does
// not set it. That is the estate's rule for the case that matters most (Ward's
// UI does the same, see vps-deploy/stacks/ward.ts): a variable the deploy passes
// that changes nothing is a variable that can silently disagree, whereas a value
// baked here and checked there cannot. Build with `npm run docs`; a wrong base
// fails the deploy by name instead of shipping a page whose every asset 404s.
//
// DOCS_BASE still overrides it, for building a copy to serve from somewhere else.
const base = process.env.DOCS_BASE ?? '/subcort/docs/'

export default defineConfig({
  base,
  site: 'https://gandolh.ro',
  integrations: [
    starlight({
      title: 'Subcort',
      description: 'A demo event-tent rental site for Gorj and Oltenia, built as a drawing set rather than a brochure.',
      tagline: 'A drawing set, not a brochure.',
      customCss: ['./src/styles/theme.css'],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/gandolh/presentation-sites' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'About this site', link: '/' },
            { label: 'README', link: '/wiki/readme/' },
            { label: 'The product', link: '/wiki/product/' },
          ],
        },
        {
          label: 'Design',
          items: [{ label: 'The design system', link: '/wiki/design/' }],
        },
      ],
    }),
  ],
})
