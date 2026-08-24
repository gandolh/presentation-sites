// Shared logic for the per-theme route files.
//
// There are 28 of those (a feed and a post route for each of the fourteen
// themes) and they are deliberately near-identical four-line files. That
// repetition buys the one property this study depends on: each route file
// statically imports exactly ONE theme, so Astro emits one CSS chunk per theme
// and a visitor to /swiss/ never downloads Maximalism's fonts.
//
// The obvious alternative — a single `[theme]` route resolving components from
// a registry — was tried and measured: every page ended up linking every
// theme's stylesheet, because Astro collects CSS from a page's whole module
// graph whether or not a component renders. The repetition is the fix.
//
// `scripts/check-routes.mjs` fails the build if a style in styles.ts has no
// route directory, so the duplication cannot silently drift.

import type { GetStaticPaths } from "astro";
import { styleBySlug, type Style, type StyleSlug } from "../content/styles";
import { posts, type Post } from "../content/posts";
import { site } from "../content/site";

export { posts };

function style(slug: StyleSlug): Style {
  const found = styleBySlug.get(slug);
  if (!found) throw new Error(`No style entry for "${slug}" in styles.ts`);
  return found;
}

/** Everything a theme's feed route needs. */
export function feedPage(slug: StyleSlug) {
  const s = style(slug);
  return {
    style: s,
    posts,
    title: `${site.name} — ${s.name}`,
    description: `${site.name}, rendered in ${s.name}. ${s.blurb}`,
  };
}

/** The twelve post paths. Identical for every theme — same posts, same order. */
export const postPaths = (() =>
  posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }))) satisfies GetStaticPaths;

/** Everything a theme's post route needs. */
export function postPage(slug: StyleSlug, post: Post) {
  const s = style(slug);
  return {
    style: s,
    title: `${post.title} — ${site.name} (${s.name})`,
    description: post.dek,
  };
}
