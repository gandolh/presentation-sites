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

// The absolute URL of a root-relative path, on the origin set by the consuming
// site's `site` option in astro.config.mjs. For tags a crawler reads without a
// page to resolve against: canonical, og:url, og:image, twitter:image, JSON-LD.
//   absoluteUrl("/")                    → "https://gandolh.ro/saloon/"
//   absoluteUrl("/images/og-image.png") → "https://gandolh.ro/saloon/images/og-image.png"
//
// A site without `site` gets a build error rather than silently shipping
// relative tags that social scrapers and search engines cannot use.
export function absoluteUrl(path: string): string {
  const site = import.meta.env.SITE;
  if (!site) {
    throw new Error(
      `absoluteUrl("${path}"): this site has no \`site\` in astro.config.mjs, ` +
        "so there is no origin to build absolute URLs on. Add " +
        "`site: process.env.PUBLIC_SITE ?? \"https://gandolh.ro\"`.",
    );
  }
  return new URL(withBase(path), site).href;
}

// The inverse of withBase: the root-relative path of a pathname that already
// carries the base. Lets a layout name the current page without every page
// passing its own path.
//   pagePath("/saloon/termeni/") → "/termeni/"   (base "/saloon/")
export function pagePath(pathname: string): string {
  const base = import.meta.env.BASE_URL; // trailing slash, e.g. "/saloon/" or "/"
  const root = base.endsWith("/") ? base : `${base}/`;
  if (pathname === root.slice(0, -1)) return "/";
  return pathname.startsWith(root) ? `/${pathname.slice(root.length)}` : pathname;
}
