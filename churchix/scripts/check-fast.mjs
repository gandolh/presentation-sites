// npm run check:fast: the type check of each project that has a changed file, then ESLint on the changed
// files, for the files changed against HEAD and the untracked ones. Nothing else, so it stays quick enough
// for the Stop hook. npm run check runs the whole typecheck, the build and the rest.
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

// Each project's own typecheck: the two packages' tsc, and the church app's astro check. A package's
// change also reaches the app, which compiles it, so the app is checked for any changed package file.
const projects = [
  ["packages/schemas/", "@churchix/schemas"],
  ["packages/ui/", "@churchix/ui"],
  ["apps/parohia-harlesti-bacau/", "@churchix-app/parohia-harlesti-bacau"],
];
const typed = changed.filter((file) => /\.(astro|[cm]?[jt]sx?|json|css)$/.test(file) && !file.startsWith("docs-site/"));
const toCheck = new Set();
for (const file of typed) {
  const project = projects.find(([prefix]) => file.startsWith(prefix));
  if (project) toCheck.add(project[1]);
  if (file.startsWith("packages/") && project && !project[0].startsWith("apps/")) toCheck.add(projects[2][1]);
}
if (toCheck.size > 0) run("npm", ["run", "typecheck", ...[...toCheck].flatMap((name) => ["-w", name])]);

const linted = changed.filter((file) => /\.(astro|[cm]?[jt]sx?)$/.test(file) && existsSync(file));
if (linted.length > 0) run("npx", ["eslint", "--no-warn-ignored", ...linted]);
