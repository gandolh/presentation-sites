import { getEntry } from "astro:content";

/** The church's `site` content entry: its name, brand, nav and giving settings. A build without one can't render. */
export async function getSite() {
  const entry = await getEntry("site", "config");
  if (!entry) throw new Error('The "site" collection has no "config" entry.');
  return entry.data;
}
