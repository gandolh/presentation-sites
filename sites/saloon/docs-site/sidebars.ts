import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// Doc items are checked at build time: a sidebar entry for a page that does not
// exist fails the build instead of rendering a dead link. Doc ids are paths
// under docs/ without the extension (docs/wiki/design.md → 'wiki/design'); the
// wiki pages are the slugs in scripts/sync-corpus.mjs.
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Start here',
      collapsible: false,
      items: [
        { type: 'doc', id: 'index', label: 'About this site' },
        { type: 'doc', id: 'wiki/readme', label: 'README' },
        { type: 'doc', id: 'wiki/product', label: 'The product' },
      ],
    },
    {
      type: 'category',
      label: 'Design',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/design', label: 'The design system' },
        { type: 'doc', id: 'wiki/tokens', label: 'Tokens' },
        { type: 'doc', id: 'wiki/adr', label: 'Decisions (ADR)' },
      ],
    },
    {
      type: 'category',
      label: 'Operating it',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/marketing', label: 'Marketing' },
        { type: 'doc', id: 'wiki/legal', label: 'Legal' },
        { type: 'doc', id: 'wiki/status', label: 'Status' },
      ],
    },
  ],
}

export default sidebars
