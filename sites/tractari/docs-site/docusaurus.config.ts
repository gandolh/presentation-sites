import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

/**
 * Documentation for the AXA Tractări demo site.
 *
 * Every page under docs/wiki/ is RENDERED from the site's own markdown —
 * README.md, PRODUCT.md, DESIGN.md and files under docs/ — by
 * scripts/sync-corpus.mjs. Those files are the working documents the site is
 * built from and they are maintained; copying them here would create a second
 * version that goes stale. Only docs/index.mdx is authored here.
 *
 * Served at /tractari/docs/ on the same origin as the site.
 */

// The deployed base path, baked in rather than injected at deploy time.
//
// vps-deploy ships what this repo already built and VERIFIES this base — it does
// not set it. A variable the deploy passes that changes nothing is a variable
// that can silently disagree, whereas a value baked here and checked there
// cannot. Build with `npm run docs`; a wrong base fails the deploy by name
// instead of shipping a page whose every asset 404s.
//
// DOCS_BASE still overrides it, for building a copy to serve from somewhere else.
const baseUrl = process.env.DOCS_BASE ?? '/tractari/docs/'

const config: Config = {
  title: 'AXA Tractări',
  tagline: 'A demo towing and roadside-assistance site for Oltenia. One job: make a stranded driver call instantly.',
  // The origin; only used for absolute URLs (sitemap, og tags). Same origin as
  // the site's own astro.config.mjs.
  url: 'https://gandolh.ro',
  baseUrl,
  // Directory-style URLs (/wiki/readme/ → wiki/readme/index.html), the layout
  // the Starlight build had, so every published URL stays the same.
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
    // Dark only: the site is "headlights on a wet road at 3am", asphalt at night rather than a white brochure (see src/css/custom.css).
    // With disableSwitch the inline script hard-codes the mode: no toggle, and a
    // stored preference is never read.
    colorMode: { defaultMode: 'dark', disableSwitch: true, respectPrefersColorScheme: false },
    // One code theme in both modes, since only one mode is ever shown; the code
    // block's ground comes from src/css/custom.css.
    prism: { theme: prismThemes.vsDark, darkTheme: prismThemes.vsDark },
    navbar: {
      title: 'AXA Tractări',
      items: [{ href: 'https://github.com/gandolh/presentation-sites', label: 'GitHub', position: 'right' }],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
