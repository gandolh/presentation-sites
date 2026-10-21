import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// Doc items are checked at build time: a sidebar entry for a page that does not
// exist fails the build instead of rendering a dead link. Doc ids are paths
// under docs/ without the extension (docs/wiki/architecture.md →
// 'wiki/architecture'); the wiki pages are the slugs in scripts/sync-corpus.mjs.
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Start here',
      collapsible: false,
      items: [
        { type: 'doc', id: 'index', label: 'What Churchix is' },
        { type: 'doc', id: 'wiki/index-wiki', label: 'The wiki index' },
        { type: 'doc', id: 'wiki/architecture', label: 'Architecture' },
        { type: 'doc', id: 'wiki/independence-model', label: 'The independence model' },
      ],
    },
    {
      type: 'category',
      label: 'Content and giving',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/content-model', label: 'The content model' },
        { type: 'doc', id: 'wiki/schema', label: 'Schemas' },
        { type: 'doc', id: 'wiki/donations', label: 'Donations' },
        { type: 'doc', id: 'wiki/i18n-and-glossary', label: 'i18n and glossary' },
      ],
    },
    {
      type: 'category',
      label: 'Design',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/design-system', label: 'The design system' },
        { type: 'doc', id: 'wiki/adr-0001', label: 'ADR 0001 — foundation' },
        { type: 'doc', id: 'wiki/adr-0002', label: 'ADR 0002 — Tailwind + Material 3' },
      ],
    },
    {
      type: 'category',
      label: 'State',
      collapsible: false,
      items: [
        { type: 'doc', id: 'wiki/decisions', label: 'Decisions' },
        { type: 'doc', id: 'wiki/log', label: 'Change log' },
      ],
    },
  ],
}

export default sidebars
