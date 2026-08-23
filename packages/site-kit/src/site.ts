// Typing for a site's git-ignored `site.local.ts` overrides.
//
// Each site defines a `defaults` object and deep-merges an optional local file
// on top of it. This type describes what that local file may contain.
//
// The array case is load-bearing. `Partial<T[]>` widens elements to
// `T | undefined`, which is both a lie about the runtime — the spread merge
// replaces an array wholesale, it never merges element-wise — and a source of
// spurious "possibly undefined" errors at every `.map()` over site data.
// Arrays are therefore all-or-nothing.
export type SiteOverridesOf<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? Partial<T[K]>
      : T[K];
};
