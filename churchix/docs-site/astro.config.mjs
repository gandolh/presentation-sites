// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

/**
 * Churchix's documentation site.
 *
 * Churchix already keeps its documentation properly — `docs/wiki/` is a real
 * maintained wiki, and `docs/adr/` holds the architecture decision records. This
 * site renders both and authors one orientation page.
 *
 * The site lives in `docs-site/` because `docs/` holds that content.
 *
 * Deployed at https://gandolh.ro/churchix/docs/.
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
const base = process.env.DOCS_BASE ?? '/churchix/docs/'

export default defineConfig({
  base,
  site: 'https://gandolh.ro',
  integrations: [
    starlight({
      title: 'Churchix',
      description:
        'A white-label church website platform — presentation sites plus a giving surface, with every parish independently deployed.',
      tagline: 'One codebase, many parishes, no shared runtime.',
      customCss: ['./src/styles/theme.css'],
      // Light only: the sites are light, and a dark parish site is not a thing
      // that exists. Offering one here would invent a second design system for a
      // platform whose premise is that there is exactly one.
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
            { label: 'What Churchix is', link: '/' },
            { label: 'The wiki index', link: '/wiki/index-wiki/' },
            { label: 'Architecture', link: '/wiki/architecture/' },
            { label: 'The independence model', link: '/wiki/independence-model/' },
          ],
        },
        {
          label: 'Content and giving',
          items: [
            { label: 'The content model', link: '/wiki/content-model/' },
            { label: 'Schemas', link: '/wiki/schema/' },
            { label: 'Donations', link: '/wiki/donations/' },
            { label: 'i18n and glossary', link: '/wiki/i18n-and-glossary/' },
          ],
        },
        {
          label: 'Design',
          items: [
            { label: 'The design system', link: '/wiki/design-system/' },
            { label: 'ADR 0001 — foundation', link: '/wiki/adr-0001/' },
            { label: 'ADR 0002 — Tailwind + Material 3', link: '/wiki/adr-0002/' },
            { label: 'UI audit', link: '/wiki/ui-audit/' },
          ],
        },
        {
          label: 'State',
          items: [
            { label: 'Decisions', link: '/wiki/decisions/' },
            { label: 'Change log', link: '/wiki/log/' },
          ],
        },
      ],
    }),
  ],
})
