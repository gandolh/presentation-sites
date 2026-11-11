import astro from "eslint-plugin-astro";
import { houseStyle } from "./vendor/house-style/eslint.config.js";

const root = import.meta.dirname;

/**
 * The house config from the vendored house-style copy, given this project's folders. Thin on purpose: the
 * compiler is the first gate, and the house adds only what it can't see. The rules and the reason for each
 * are in the copy.
 */
const house = houseStyle({
  root,
  // The church site and the shared UI: their React islands get the hooks rules.
  web: ["apps/parohia-harlesti-bacau/src", "packages/ui/src"],
  // Scripts run by hand, which print: the UI package's max-w guard.
  scripts: ["packages/*/scripts"],
  // Astro hydrates a React island through its default export.
  defaultExports: ["packages/ui/src/islands/*.tsx"],
  // An .astro file's <script> blocks reach ESLint as virtual files no tsconfig holds.
  untyped: ["**/*.astro/*.ts"],
  // The Docusaurus docs site is its own project with its own checks, the design source is exported HTML,
  // and .astro/ holds Astro's generated types.
  ignores: ["docs-site/**", "docs/**", "**/.astro/**"],
});

// house-style 1.1.0 has no Astro preset, and scopes its blocks to TypeScript and JavaScript files. These
// two blocks hold its rules, which the Astro block below applies to .astro files too.
const block = (name) => house.find((config) => config.name === name);
const shapes = block("house-style/base");
const typed = block("house-style/typed");

export default [
  ...house,
  // eslint-plugin-astro's parser and rules for .astro files and the <script> blocks inside them.
  ...astro.configs["flat/recommended"],
  {
    // The house shapes and the six typed rules, in .astro frontmatter and markup. astro-eslint-parser has
    // no projectService, so typed lint finds each project's tsconfig.json through `project: true`.
    name: "churchix/astro",
    files: ["**/*.astro"],
    plugins: shapes.plugins,
    languageOptions: { parserOptions: { project: true, tsconfigRootDir: root } },
    rules: { ...shapes.rules, ...typed.rules },
  },
];
