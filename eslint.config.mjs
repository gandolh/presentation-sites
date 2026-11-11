import astro from "eslint-plugin-astro";
import { houseStyle } from "./vendor/house-style/eslint.config.js";

const root = import.meta.dirname;
const bots = "sites/saloon/marketing/bots";

/**
 * The house config from the vendored house-style copy, given this repo's folders. Thin on purpose: the
 * compiler is the first gate, and the house adds only what it can't see. The rules and the reason for
 * each are in the copy.
 */
const house = houseStyle({
  root,
  // The four live sites: their React islands get the hooks rules.
  web: ["sites/auto-service/src", "sites/saloon/src", "sites/subcort/src", "sites/tractari/src"],
  // Scripts run by hand, which print and read the environment: the sites' generators.
  scripts: ["scripts", "sites/*/scripts"],
  // Astro hydrates a React island through its default export.
  defaultExports: ["sites/*/src/components/**/*.tsx"],
  // Allowed to print: the bots' logger, and their server entry, which logs a boot failure before the
  // logger exists.
  console: [`${bots}/src/core/logger.ts`, `${bots}/src/server.ts`],
  // The bots' tests run on node:test.
  vitest: false,
  // An .astro file's <script> blocks reach ESLint as virtual files no tsconfig holds.
  untyped: ["**/*.astro/*.ts"],
  // Churchix and the docs sites are projects with their own checks; design-study is a study, outside
  // lint (decided 2026-11-10); .astro/ holds Astro's generated types.
  ignores: ["churchix/**", "sites/*/docs-site/**", "sites/design-study/**", "**/.astro/**"],
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
    // no projectService, so typed lint finds each site's tsconfig.json through `project: true`.
    name: "presentation-sites/astro",
    files: ["**/*.astro"],
    plugins: shapes.plugins,
    languageOptions: { parserOptions: { project: true, tsconfigRootDir: root } },
    rules: { ...shapes.rules, ...typed.rules },
  },
  {
    // Off for now (2026-11-11): subcort and tractari don't have noUncheckedIndexedAccess yet, and without
    // it this rule calls every `!` on an indexed read unnecessary, so its autofix would strip what the flag
    // needs back. It comes back on with the flag.
    name: "presentation-sites/unchecked-index-off",
    files: ["sites/subcort/**", "sites/tractari/**"],
    rules: { "@typescript-eslint/no-unnecessary-type-assertion": "off" },
  },
  {
    // A warning for now (2026-11-11): the bots' replies read the salon's WhatsApp number from the
    // environment themselves. When that setting moves into core/config.ts, this block goes.
    name: "presentation-sites/bots-process-env-warns",
    files: [`${bots}/src/bots/responses/replies.ts`],
    rules: { "n/no-process-env": "warn" },
  },
];
