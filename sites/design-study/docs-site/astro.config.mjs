// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

/**
 * Documentation for the Fourteen Renderings presentation site.
 *
 * Every page under "The site" is RENDERED from the site's own markdown —
 * README.md, PRODUCT.md, DESIGN.md and anything under docs/ — by
 * scripts/sync-corpus.mjs. Those files are the working documents the site is
 * built from and they are maintained; copying them here would create a second
 * version that goes stale.
 *
 * Deployed at https://gandolh.ro/design-study/docs/.
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
const base = process.env.DOCS_BASE ?? '/design-study/docs/'

export default defineConfig({
  base,
  site: 'https://gandolh.ro',
  integrations: [
    starlight({
      title: 'Fourteen Renderings',
      description: 'One blog, fourteen design languages, the content held constant so only the design varies.',
      tagline: 'The instrument, not the specimen.',
      customCss: ['./src/styles/theme.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/gandolh/presentation-sites' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'About this study', link: '/' },
            { label: 'README', link: '/wiki/readme/' },
            { label: 'The product', link: '/wiki/product/' },
            { label: 'The chrome and the seams', link: '/wiki/design/' },
          ],
        },
        {
          label: 'The fourteen',
          items: [
            { label: 'How they are documented', link: '/wiki/styles/' },
            { label: 'Minimalism', link: '/wiki/minimalism/' },
            { label: 'Swiss', link: '/wiki/swiss/' },
            { label: 'Brutalism', link: '/wiki/brutalism/' },
            { label: 'NeoBrutalism', link: '/wiki/neo-brutalism/' },
            { label: 'Maximalism', link: '/wiki/maximalism/' },
            { label: 'Surrealism', link: '/wiki/surrealism/' },
            { label: 'Bohemian', link: '/wiki/bohemian/' },
            { label: 'Ethereal', link: '/wiki/ethereal/' },
            { label: 'Skeuomorphism', link: '/wiki/skeuomorphism/' },
            { label: 'Neumorphism', link: '/wiki/neumorphism/' },
            { label: 'Claymorphism', link: '/wiki/claymorphism/' },
            { label: 'Glassmorphism', link: '/wiki/glassmorphism/' },
            { label: 'Liquid Glass', link: '/wiki/liquid-glass/' },
            { label: 'Spatial UI', link: '/wiki/spatial/' },
          ],
        },
      ],
    }),
  ],
})
