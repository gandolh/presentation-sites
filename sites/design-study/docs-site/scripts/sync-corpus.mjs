// Render the site's own Markdown into the Docusaurus docs tree.
// The site's README.md, PRODUCT.md, DESIGN.md and the files under docs/ are the
// working documents it is built from, so they are the single source of truth;
// this script only *renders* them, and never writes back.
//
//   sites/<site>/<src>  ─►  docs-site/docs/wiki/<slug>.md
//                            (frontmatter rewritten to Docusaurus's keys, links
//                             resolved to file links Docusaurus checks)
//
// The generated files carry a "do not edit" banner and are gitignored. Run via
// `npm run sync-corpus` (also runs before `start` and `docs`).

// Which pages become docs, in sidebar order. `src` is the path inside the site;
// `slug` is the file stem under docs/wiki/ and therefore the URL (/wiki/<slug>/).
// The slugs are the published URLs: don't rename one without a redirect.
const PAGES = [
  { src: 'README.md', slug: 'readme' },
  { src: 'PRODUCT.md', slug: 'product' },
  { src: 'DESIGN.md', slug: 'design' },
  { src: 'docs/styles/README.md', slug: 'styles' },
  { src: 'docs/styles/minimalism.md', slug: 'minimalism' },
  { src: 'docs/styles/swiss.md', slug: 'swiss' },
  { src: 'docs/styles/brutalism.md', slug: 'brutalism' },
  { src: 'docs/styles/neo-brutalism.md', slug: 'neo-brutalism' },
  { src: 'docs/styles/maximalism.md', slug: 'maximalism' },
  { src: 'docs/styles/surrealism.md', slug: 'surrealism' },
  { src: 'docs/styles/bohemian.md', slug: 'bohemian' },
  { src: 'docs/styles/ethereal.md', slug: 'ethereal' },
  { src: 'docs/styles/skeuomorphism.md', slug: 'skeuomorphism' },
  { src: 'docs/styles/neumorphism.md', slug: 'neumorphism' },
  { src: 'docs/styles/claymorphism.md', slug: 'claymorphism' },
  { src: 'docs/styles/glassmorphism.md', slug: 'glassmorphism' },
  { src: 'docs/styles/liquid-glass.md', slug: 'liquid-glass' },
  { src: 'docs/styles/spatial.md', slug: 'spatial' },
]

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { dirname, resolve, relative, posix, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const GITHUB_REPO = 'https://github.com/gandolh/presentation-sites'
const BRANCH = 'main'

const here = dirname(fileURLToPath(import.meta.url))
// docs-site/scripts/ → the site is two levels up, the monorepo root four.
const siteRoot = resolve(here, '../..')
const repoRoot = resolve(siteRoot, '../..')
const outDir = resolve(here, '../docs/wiki')
const siteRel = relative(repoRoot, siteRoot).split(sep).join('/') // sites/<site>

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
 * Rewrite the relative links in one page. `src` is the page's path inside the
 * site (e.g. `docs/STATUS.md`); `known` maps site paths to slugs. Fenced code
 * blocks are left alone, since a `[x](y)` in an example is not a link. Prose is
 * matched as a whole block, not line by line, because link text wraps:
 * `[the design\nsystem](DESIGN.md)` is one link.
 */
function rewriteLinks(body, src, known, warnings) {
  const blocks = []
  let fence = null
  for (const line of body.split('\n')) {
    const open = /^\s*(`{3,}|~{3,})/.exec(line)
    const inCode = fence !== null || open !== null
    if (open) fence = fence === null ? open[1][0] : open[1][0] === fence ? null : fence
    const last = blocks.at(-1)
    if (last && last.code === inCode) last.lines.push(line)
    else blocks.push({ code: inCode, lines: [line] })
  }

  return blocks
    .map(({ code, lines }) => {
      const text = lines.join('\n')
      if (code) return text
      return text.replace(
        /(!?)\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
        (whole, bang, label, target, title = '') => {
          const next = rewriteTarget(target, src, known, bang === '!', warnings)
          if (next === null) return label
          return next === target ? whole : `${bang}[${label}](${next}${title})`
        },
      )
    })
    .join('\n')
}

/**
 * Resolve one link target against the SOURCE file's directory inside the site:
 *   - a page in PAGES becomes a relative file link (`./design.md#anchor`), which
 *     Docusaurus resolves to the right route under any baseUrl and checks at
 *     build time;
 *   - anything else in the repo becomes its GitHub URL: `tree/` for a
 *     directory, `raw/` for an image, `blob/` for a file.
 * URLs, root-absolute paths and bare anchors are left as they are.
 */
function rewriteTarget(target, src, known, isImage, warnings) {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return target
  const [pathPart, anchor] = target.split('#')
  const hash = anchor ? `#${anchor}` : ''
  const resolved = posix.normalize(posix.join(posix.dirname(src), decodeURI(pathPart)))

  if (!isImage && known.has(resolved)) return `./${known.get(resolved)}.md${hash}`

  const abs = resolve(siteRoot, resolved)
  const repoPath = relative(repoRoot, abs).split(sep).join('/')
  if (repoPath.startsWith('..')) {
    warnings.push(`${src}: link leaves the repo, kept as text — ${target}`)
    return null
  }
  let kind = 'blob'
  if (!existsSync(abs)) warnings.push(`${src}: link target does not exist — ${target}`)
  else if (statSync(abs).isDirectory()) kind = 'tree'
  // An image needs the raw bytes, not GitHub's HTML page for the file.
  if (isImage) return `${GITHUB_REPO}/raw/${BRANCH}/${repoPath}`
  return `${GITHUB_REPO}/${kind}/${BRANCH}/${repoPath}${hash}`
}

const yamlEscape = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'

async function main() {
  // Fresh output each run so deleted pages don't linger.
  if (existsSync(outDir)) await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const present = PAGES.filter(({ src }) => {
    if (existsSync(resolve(siteRoot, src))) return true
    console.warn(`  ! skipping ${src} — not found`)
    return false
  })
  const known = new Map(present.map((p) => [p.src, p.slug]))

  const warnings = []
  for (const { src, slug } of present) {
    const raw = await readFile(resolve(siteRoot, src), 'utf8')
    const { fm, body: afterFm } = splitFrontmatter(raw)
    const fallbackTitle = slug.replace(/(^|-)([a-z])/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase())
    const { title, body } = extractTitle(afterFm, fallbackTitle)
    const description = (fm.summary || '').replace(/\s+/g, ' ').slice(0, 160)
    const updated = fm.updated ? ` · updated ${fm.updated}` : ''

    const front = [
      '---',
      `title: ${yamlEscape(title)}`,
      description ? `description: ${yamlEscape(description)}` : null,
      // Explicit, because Docusaurus serves a file named readme.md (or one named
      // after its folder) at the folder's URL, and the URL is the slug.
      `slug: ${slug}`,
      'toc_max_heading_level: 3',
      '---',
      '',
      // No :::note[title] here: in a .md page (CommonMark) Docusaurus leaves the
      // bracketed title as an unknown <mdxadmonitiontitle> element, so the title
      // goes in the body as its first line.
      ':::note',
      `**Rendered from \`${siteRel}/${src}\`${updated}.**`,
      `This page is generated from the site's own docs and rewritten on every docs build. Edit the source in \`${siteRel}/\`, not here.`,
      ':::',
      '',
    ]
      .filter((l) => l !== null)
      .join('\n')

    const rendered = rewriteLinks(body, src, known, warnings)
    await writeFile(resolve(outDir, `${slug}.md`), front + rendered.trimStart(), 'utf8')
  }
  for (const w of warnings) console.warn(`  ! ${w}`)
  console.log(`sync-corpus: wrote ${present.length} page(s) → docs/wiki/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
