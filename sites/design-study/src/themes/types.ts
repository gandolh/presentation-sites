// The contract every theme implements.
//
// A theme owns its markup, its layout and its CSS — that is the premise of this
// study. What it does NOT own is the data, the routing, or the order of the
// post page (carousel first, body second). Those are the control variables; if
// a theme changed them, the comparison would stop meaning anything.

import type { StyleSlug } from "../content/styles";

export type ThemeMeta = {
  slug: StyleSlug;
  /**
   * How this theme represents itself in the *neutral* chrome — the landing
   * gallery card and the switcher. Deliberately three flat values rather than
   * a live preview: the chrome must not start looking like the theme.
   */
  swatch: { bg: string; fg: string; accent: string };
  /** `<meta name="theme-color">` for the browser UI. */
  themeColor: string;
  /**
   * Whether the theme's page background is light or dark. The neutral switcher
   * reads this to pick a contrast that survives on top of it.
   */
  scheme: "light" | "dark";
};
