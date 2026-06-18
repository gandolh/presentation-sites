/**
 * Sub-path-aware link helpers (Ecclesia Digitalis).
 *
 * When a church is served under a URL sub-path (e.g. the shared VPS serves it at
 * `http://<ip>/parohia-harlesti-bacau/`), Astro is built with a `base` and exposes
 * it as `import.meta.env.BASE_URL` (always ends in `/`, defaults to `/` at root).
 *
 * Root-absolute internal links authored as `/despre` must be rewritten to
 * `<base>/despre` or they resolve against the server root and 404. These helpers
 * centralize that join so call sites stay readable and the rewrite logic lives in
 * exactly one place. External, anchor, and protocol links pass through untouched.
 */

/** Astro's configured base. Always normalized to start and end with `/`. */
function baseUrl(): string {
  // import.meta.env.BASE_URL is injected by Vite/Astro at build time.
  const raw = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  let b = raw.startsWith('/') ? raw : `/${raw}`;
  if (!b.endsWith('/')) b += '/';
  return b;
}

/** True for links that must NOT be base-prefixed (external / non-navigational). */
function isExternal(href: string): boolean {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#') ||
    href.startsWith('data:')
  );
}

/**
 * Prefix a root-absolute internal path (`/despre`, `/logo.svg`, `/`) with the
 * Astro base. Relative paths and external links are returned unchanged.
 *
 *   withBase('/despre')  // base '/' -> '/despre'; base '/parish/' -> '/parish/despre'
 *   withBase('/')        // -> '/' or '/parish/'
 *   withBase('https://…')// -> unchanged
 */
export function withBase(href: string | undefined | null): string {
  if (!href) return baseUrl();
  if (isExternal(href) || !href.startsWith('/')) return href;
  const b = baseUrl();
  // Strip the leading slash off href so we don't double it against base's trailing slash.
  return b + href.slice(1);
}

/**
 * Strip the base prefix off a runtime pathname so it can be compared against
 * authored, root-relative hrefs (e.g. for active-nav detection). Astro's
 * `Astro.url.pathname` includes the base; nav config does not.
 *
 *   stripBase('/parish/despre') // base '/parish/' -> '/despre'
 *   stripBase('/parish/')       // -> '/'
 */
export function stripBase(pathname: string): string {
  const b = baseUrl();
  if (b === '/') return pathname || '/';
  if (pathname === b || pathname === b.slice(0, -1)) return '/';
  if (pathname.startsWith(b)) return '/' + pathname.slice(b.length);
  return pathname || '/';
}
