// Prefix a root-relative path with Astro's configured `base` so links and
// public/ assets resolve correctly when a site is served under a sub-path
// (e.g. http://HOST/saloon). For local dev (base "/") this is a no-op.
//
// Use for hand-written internal links and public/ asset references:
//   withBase("/")            → "/saloon/"            (build) | "/" (dev)
//   withBase("/termeni/")    → "/saloon/termeni/"
//   withBase("/favicon.svg") → "/saloon/favicon.svg"
//
// Astro already prefixes bundled assets (imported CSS/JS) automatically — this
// is only needed for paths written by hand or built as plain strings.
//
// `BASE_URL` is resolved per build by the *consuming* site, so this one
// implementation serves every site without knowing which it is running in.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // trailing slash, e.g. "/saloon/" or "/"
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}
