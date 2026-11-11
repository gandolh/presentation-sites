// The house format from the vendored house-style copy (width 120, trailing commas), plus the Astro layer
// house-style doesn't ship yet: prettier-plugin-astro formats .astro files with its own parser.
import house from "./vendor/house-style/prettier.config.js";

export default {
  ...house,
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
