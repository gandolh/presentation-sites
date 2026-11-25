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
      label: 'How it is built',
      collapsible: false,
      items: [
        { type: 'doc', id: 'parts', label: 'The part table' },
        { type: 'doc', id: 'chapters', label: 'Chapters and islands' },
        { type: 'doc', id: 'three', label: 'The 3D island' },
        { type: 'doc', id: 'copy', label: 'The copy rule' },
      ],
    },
    {
      type: 'category',
      label: 'Design',
      collapsible: false,
      items: [{ type: 'doc', id: 'wiki/design', label: 'The design system' }],
    },
  ],
}

export default sidebars
