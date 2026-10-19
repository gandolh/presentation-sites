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
        { type: 'doc', id: 'index', label: 'About this study' },
        { type: 'doc', id: 'wiki/readme', label: 'README' },
        { type: 'doc', id: 'wiki/product', label: 'The product' },
        { type: 'doc', id: 'wiki/design', label: 'The chrome and the seams' },
      ],
    },
    {
      type: 'category',
      label: 'The fourteen',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/styles', label: 'How they are documented' },
        { type: 'doc', id: 'wiki/minimalism', label: 'Minimalism' },
        { type: 'doc', id: 'wiki/swiss', label: 'Swiss' },
        { type: 'doc', id: 'wiki/brutalism', label: 'Brutalism' },
        { type: 'doc', id: 'wiki/neo-brutalism', label: 'NeoBrutalism' },
        { type: 'doc', id: 'wiki/maximalism', label: 'Maximalism' },
        { type: 'doc', id: 'wiki/surrealism', label: 'Surrealism' },
        { type: 'doc', id: 'wiki/bohemian', label: 'Bohemian' },
        { type: 'doc', id: 'wiki/ethereal', label: 'Ethereal' },
        { type: 'doc', id: 'wiki/skeuomorphism', label: 'Skeuomorphism' },
        { type: 'doc', id: 'wiki/neumorphism', label: 'Neumorphism' },
        { type: 'doc', id: 'wiki/claymorphism', label: 'Claymorphism' },
        { type: 'doc', id: 'wiki/glassmorphism', label: 'Glassmorphism' },
        { type: 'doc', id: 'wiki/liquid-glass', label: 'Liquid Glass' },
        { type: 'doc', id: 'wiki/spatial', label: 'Spatial UI' },
      ],
    },
  ],
}

export default sidebars
