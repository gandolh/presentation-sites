// npm run check:fast: the type check of each project that has a changed file, then ESLint on the changed
// files, for the files changed against HEAD and the untracked ones. Nothing else, so it stays quick enough
// for the Stop hook. The whole typecheck (every site in turn) is too slow for that: npm run check runs it.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
// A deleted file still changes its project, so it counts for the type check; ESLint gets the files that exist.
const changed = [
  ...new Set([
    ...git("diff", "--name-only", "--relative", "HEAD"),
    ...git("ls-files", "--others", "--exclude-standard"),
  ]),
];

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

// Each project's own typecheck: the five sites' astro check, the kit's tsc, and the saloon bots' tsc.
const workspaces = {
  "sites/auto-service/": "bavauto-gorj",
  "sites/saloon/": "ana-saloon",
  "sites/subcort/": "subcort",
  "sites/tractari/": "tractari",
  "sites/design-study/": "design-study",
  "packages/site-kit/": "@sites/kit",
};
const bots = "sites/saloon/marketing/bots/";
const typed = changed.filter((file) => /\.(astro|[cm]?[jt]sx?|json)$/.test(file) && !file.includes("/docs-site/"));
const toCheck = new Set();
let checkBots = false;
for (const file of typed) {
  if (file.startsWith(bots)) checkBots = true;
  else {
    const folder = Object.keys(workspaces).find((prefix) => file.startsWith(prefix));
    if (folder) toCheck.add(workspaces[folder]);
  }
}
if (toCheck.size > 0) run("npm", ["run", "typecheck", ...[...toCheck].flatMap((name) => ["-w", name])]);
if (checkBots) run("npm", ["--prefix", bots, "run", "typecheck"]);

const linted = changed.filter((file) => /\.(astro|[cm]?[jt]sx?)$/.test(file) && existsSync(file));
if (linted.length > 0) run("npx", ["eslint", "--no-warn-ignored", ...linted]);
