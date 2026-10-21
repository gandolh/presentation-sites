import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

/**
 * Churchix's documentation site.
 *
 * Churchix already keeps its documentation properly — `corpus/` is a real
 * maintained wiki, and `docs/adr/` holds the architecture decision records. This
 * site renders both (scripts/sync-corpus.mjs writes them into docs/wiki/) and
 * authors one orientation page, docs/index.mdx.
 *
 * The site lives in `docs-site/` because `docs/` holds the ADRs and the design.
 * It is the only React-rendered thing here that is not a church site's island:
 * the church sites stay Astro (see ../CLAUDE.md), and react/react-dom are pinned
 * to the apps' version so @churchix/ui never sees two copies.
 *
 * Served at /churchix/docs/ on the shared origin.
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
const baseUrl = process.env.DOCS_BASE ?? '/churchix/docs/'

const config: Config = {
  title: 'Churchix',
  tagline:
    'A white-label church website platform — presentation sites plus a giving surface, with every parish independently deployed.',
  // The origin; only used for absolute URLs (sitemap, og tags).
  url: 'https://gandolh.ro',
  baseUrl,
  // Directory-style URLs (/wiki/architecture/ → wiki/architecture/index.html),
  // the layout the Starlight build had, so every published URL stays the same.
  trailingSlash: true,
  future: { v4: true },
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: {
    // .md (the synced pages) parses as CommonMark, .mdx (the landing) as MDX.
    format: 'detect',
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // docs-only site: no /docs/ prefix under the base
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  // Local, offline search (Starlight shipped Pagefind; Docusaurus ships nothing).
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, docsRouteBasePath: '/', indexBlog: false, indexPages: false },
    ],
  ],
  themeConfig: {
    // Light only: the sites are light, and a dark parish site is not a thing that
    // exists. Offering one here would invent a second design system for a
    // platform whose premise is that there is exactly one (see src/css/custom.css).
    // With disableSwitch the inline script hard-codes the mode: no toggle, and a
    // stored preference is never read.
    colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false },
    // One code theme in both modes, since only one mode is ever shown; the code
    // block's ground comes from src/css/custom.css.
    prism: { theme: prismThemes.github, darkTheme: prismThemes.github },
    navbar: {
      title: 'Churchix',
      items: [{ href: 'https://github.com/gandolh/presentation-sites', label: 'GitHub', position: 'right' }],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
