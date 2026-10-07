// Sync churchix's hand-authored docs into the Starlight content tree. The
// sources are the corpus (corpus/index.md, corpus/CLAUDE.md, corpus/log.md,
// corpus/wiki/*.md) and the ADRs (docs/adr/*.md). This script only *renders*
// them; it never writes back.
//
//   corpus/wiki/<page>.md ─┐
//   corpus/*.md            ┼─►  src/content/docs/wiki/<slug>.md
//   docs/adr/*.md          ┘     (frontmatter rewritten to Starlight's schema,
//                                 links to other rendered pages remapped to /wiki/<slug>/,
//                                 every other relative link pointed at GitHub)
//
// The generated files carry a "do not edit" banner and are gitignored. Run via
// `npm run sync-corpus` (also runs automatically before `dev` and `docs`).

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
// docs-site/scripts/ → the churchix root is two levels up. Every `src` below is
// relative to it.
const root = resolve(here, '../..')
const outDir = resolve(here, '../src/content/docs/wiki')
const GITHUB = 'https://github.com/gandolh/presentation-sites/blob/main/churchix'

// Which pages become docs, in sidebar-ish order. `slug` is the URL/file stem
// under /wiki/; links between these are rewritten to /wiki/<slug>/.
const PAGES = [
  { src: 'corpus/index.md', slug: 'index-wiki' },
  { src: 'corpus/wiki/architecture.md', slug: 'architecture' },
  { src: 'corpus/wiki/independence-model.md', slug: 'independence-model' },
  { src: 'corpus/wiki/content-model.md', slug: 'content-model' },
  { src: 'corpus/CLAUDE.md', slug: 'schema' },
  { src: 'corpus/wiki/donations.md', slug: 'donations' },
  { src: 'corpus/wiki/design-system.md', slug: 'design-system' },
  { src: 'corpus/wiki/i18n-and-glossary.md', slug: 'i18n-and-glossary' },
  { src: 'corpus/wiki/decisions.md', slug: 'decisions' },
  { src: 'corpus/log.md', slug: 'log' },
  { src: 'docs/adr/0001-design-system-foundation.md', slug: 'adr-0001' },
  { src: 'docs/adr/0002-tailwind-material3-design-system.md', slug: 'adr-0002' },
]

const SLUG_BY_SRC = new Map(PAGES.map((p) => [p.src, p.slug]))

// The wiki and the work items lived under docs/ until 2026-10-07. The ADRs are
// frozen records and still link those paths, so map them to where the pages
// live now. Exact paths first, then directory prefixes.
const MOVED = [
  ['docs/wiki/SCHEMA.md', 'corpus/CLAUDE.md'],
  ['docs/wiki/index.md', 'corpus/index.md'],
  ['docs/wiki/log.md', 'corpus/log.md'],
  ['docs/todo/README.md', 'corpus/wiki/status.md'],
  ['docs/wiki/', 'corpus/wiki/'],
]

function relocate(rel) {
  for (const [from, to] of MOVED) {
    if (from.endsWith('/') ? rel.startsWith(from) : rel === from) return to + rel.slice(from.length)
  }
  return rel
}

/** Split leading `--- ... ---` frontmatter from a markdown body. */
function splitFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!m) return { fm: {}, body: raw }
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_-]+):\s*(.*)$/.exec(line)
    if (kv) fm[kv[1]] = kv[2].trim()
  }
  return { fm, body: raw.slice(m[0].length) }
}

/** Pull the first `# H1` as the title, and strip it from the body. */
function extractTitle(body, fallback) {
  const m = /^#\s+(.+?)\s*$/m.exec(body)
  if (m && body.slice(0, m.index).trim() === '') {
    return { title: m[1].trim(), body: body.slice(m.index + m[0].length).replace(/^\r?\n/, '') }
  }
  return { title: fallback, body }
}

/**
 * Resolve every relative link from the folder of the page it sits in. A link to
 * another rendered page becomes its /wiki/<slug>/ route; anything else inside
 * churchix (briefs, todos, source files) points at the repo on GitHub.
 */
function rewriteLinks(body, src) {
  const fromDir = dirname(resolve(root, src))
  return body.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    if (/^(https?:|mailto:|#|\/)/.test(target)) return whole
    const at = target.indexOf('#')
    const pathPart = at === -1 ? target : target.slice(0, at)
    const hash = at === -1 ? '' : target.slice(at)
    if (!pathPart) return whole
    const rel = relocate(relative(root, resolve(fromDir, pathPart)).split(sep).join('/'))
    if (rel.startsWith('..')) return whole
    const slug = SLUG_BY_SRC.get(rel)
    if (slug) return `](/wiki/${slug}/${hash})`
    return `](${GITHUB}/${rel}${hash})`
  })
}

function yamlEscape(s) {
  return '"' + String(s).replace(/"/g, '\\"') + '"'
}

async function main() {
  // Fresh output each run so deleted corpus pages don't linger.
  if (existsSync(outDir)) await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  let count = 0
  for (const { src, slug } of PAGES) {
    const srcPath = resolve(root, src)
    if (!existsSync(srcPath)) {
      console.warn(`  ! skipping ${src} — not found`)
      continue
    }
    const raw = await readFile(srcPath, 'utf8')
    const { fm, body: afterFm } = splitFrontmatter(raw)
    const fallbackTitle = slug.replace(/(^|-)([a-z])/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase())
    const { title, body } = extractTitle(afterFm, fallbackTitle)

    const description = (fm.summary || '').replace(/\s+/g, ' ').slice(0, 160)
    const updated = fm.updated ? ` · updated ${fm.updated}` : ''

    const front = [
      '---',
      `title: ${yamlEscape(title)}`,
      description ? `description: ${yamlEscape(description)}` : null,
      'tableOfContents:',
      '  maxHeadingLevel: 3',
      '---',
      '',
      `:::note[Rendered from \`churchix/${src}\`${updated}]`,
      'This page is generated from churchix\'s own docs and rewritten on every docs build. Edit the source in `churchix/`, not here.',
      ':::',
      '',
    ]
      .filter((l) => l !== null)
      .join('\n')

    await writeFile(resolve(outDir, `${slug}.md`), front + rewriteLinks(body, src).trimStart(), 'utf8')
    count++
  }
  console.log(`sync-corpus: wrote ${count} page(s) → src/content/docs/wiki/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
