// The mock/real image pipeline, shared by every site that has one.
//
//   "mock" (default) → committed SVG placeholders in  public/images/<name>.svg
//   "real"           → git-ignored real photos in     public/images/real/<name>.<ext>
//
// Components and content reference images by their logical base name
// (e.g. "hero", "gallery-01"), so switching sources never edits a path.
//
// What differs per site is *data*, not logic: which logical names actually have
// a real photo, and what extension those photos use. Each site therefore keeps
// a small `src/content/images.ts` that calls `createImages()` with its own
// values and re-exports the result.

import { withBase } from "./url";

export type ImageSource = "mock" | "real";

/** The source this build is using. Set `PUBLIC_IMAGE_SOURCE=real` to flip it. */
export const IMAGE_SOURCE: ImageSource =
  (import.meta.env.PUBLIC_IMAGE_SOURCE as string | undefined) === "real"
    ? "real"
    : "mock";

export type CreateImagesOptions = {
  /**
   * Logical names that actually have a real photo in `public/images/real/`.
   * When the source is "real", only these resolve to the real file; every other
   * name falls back to its committed SVG mock so nothing 404s.
   */
  hasReal?: Iterable<string>;
  /** Extension of the real photos. Defaults to "jpeg". */
  realExt?: string;
  /** Extension of the committed placeholders. Defaults to "svg". */
  mockExt?: string;
};

/**
 * Build a site's `img()` resolver.
 *
 *   img("gallery-01") → "/images/real/gallery-01.jpeg"  (real source, has photo)
 *   img("hero")       → "/images/hero.svg"              (real source, no photo)
 *   img("hero")       → "/images/hero.svg"              (mock source)
 */
export function createImages(options: CreateImagesOptions = {}) {
  const { hasReal = [], realExt = "jpeg", mockExt = "svg" } = options;
  const real = new Set(hasReal);

  return function img(name: string): string {
    if (IMAGE_SOURCE === "real" && real.has(name)) {
      return withBase(`/images/real/${name}.${realExt}`);
    }
    return withBase(`/images/${name}.${mockExt}`);
  };
}
