// Prefix a root-relative path with Astro's configured `base` so links and
// public/ assets resolve correctly when the showcase itself is served under a
// sub-path (http://HOST/showcase). For local dev (base "/") this is a no-op.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // trailing slash, e.g. "/showcase/" or "/"
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}

// Build the URL to a sibling live site on the SAME VPS. Every site is deployed
// under its own sub-path (/saloon, /tractari, ...). The VPS host is a runtime
// fact (a bare IP behind Caddy), injected at build time via PUBLIC_SITES_HOST —
// it is never committed to the repo.
//
//   PUBLIC_SITES_HOST="http://203.0.113.5"  → "http://203.0.113.5/saloon"
//   (unset, e.g. local dev)                 → "/saloon"  (same-origin fallback)
//
// The fallback keeps the gallery functional when previewed on the VPS itself,
// and harmless (just a dead relative link) when run in isolation locally.
export function siteUrl(path: string): string {
  const host = import.meta.env.PUBLIC_SITES_HOST?.replace(/\/+$/, "") ?? "";
  return host ? `${host}${path}` : path;
}
