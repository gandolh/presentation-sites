// Theme metadata for the neutral gallery.
//
// Only `meta.ts` is globbed here — those files import nothing but a type, so
// enumerating all fourteen costs the gallery page no CSS and no fonts. The
// components themselves are NOT resolved through a registry: each theme is
// imported statically by its own route files, which is what keeps one theme's
// stylesheet off the other thirteen's pages. See src/lib/routes.ts.

import type { ThemeMeta } from "./types";

const metas = import.meta.glob<{ meta: ThemeMeta }>("./*/meta.ts");

/** Swatch + scheme for every theme, in no particular order. */
export async function allThemeMeta(): Promise<ThemeMeta[]> {
  const loaded = await Promise.all(Object.values(metas).map((load) => load()));
  return loaded.map((m) => m.meta);
}
