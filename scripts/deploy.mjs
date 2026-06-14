#!/usr/bin/env node
/**
 * Monorepo deploy CLI — pick a project and an action, then delegate to that
 * project's own deploy script via the root passthrough (`npm run <site>:...`).
 *
 * Zero dependencies (native Node readline + child_process). Run from the repo
 * root, usually via the root package.json:
 *
 *   npm run deploy                    # interactive: pick project, then action
 *   npm run deploy -- tractari        # project given, pick the action
 *   npm run deploy -- tractari deploy # fully non-interactive
 *   npm run deploy -- --list          # list discovered projects + exit
 *
 * Actions:
 *   pre-deploy | pre   → <site>:deploy:pre   (provision the server)
 *   deploy     | push  → <site>:deploy       (build + upload)
 *   all                → <site>:deploy:all   (pre-deploy then deploy)
 *
 * Flags:
 *   --dry-run   print the npm command instead of running it
 *   --list      list discovered deployable projects and exit
 *
 * Projects are auto-discovered: any sibling directory whose package.json has a
 * `deploy:push` script is offered. Add a new site and it shows up here for free.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// --- tiny terminal helpers --------------------------------------------------
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};
const isTTY = stdout.isTTY;
const paint = (s, col) => (isTTY ? `${col}${s}${c.reset}` : s);
const step = (m) => console.log(`${paint("▸", c.cyan)} ${m}`);
const ok = (m) => console.log(`${paint("✓", c.green)} ${m}`);
function die(m) {
  console.error(paint(`✗ ${m}`, c.red));
  process.exit(1);
}

// --- discover deployable projects -------------------------------------------
// A project is any top-level dir with a package.json exposing `deploy:push`.
function discoverProjects() {
  const out = [];
  for (const name of readdirSync(ROOT, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    if (name.name.startsWith(".") || name.name === "node_modules") continue;
    const pkgPath = join(ROOT, name.name, "package.json");
    if (!existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const scripts = pkg.scripts ?? {};
      if (scripts["deploy:push"]) {
        out.push({
          dir: name.name,
          // The root passthrough scripts follow `<dir>:deploy*`. Verify they
          // exist so we delegate to the documented entrypoint.
          hasRootScripts: rootHasDeployScripts(name.name),
        });
      }
    } catch {
      /* skip unreadable package.json */
    }
  }
  return out.sort((a, b) => a.dir.localeCompare(b.dir));
}

let _rootPkg = null;
function rootPkg() {
  if (!_rootPkg) _rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  return _rootPkg;
}
function rootHasDeployScripts(dir) {
  const s = rootPkg().scripts ?? {};
  return Boolean(s[`${dir}:deploy:pre`] && s[`${dir}:deploy`] && s[`${dir}:deploy:all`]);
}

// --- actions ----------------------------------------------------------------
const ACTIONS = [
  { key: "pre-deploy", aliases: ["pre"], rootSuffix: "deploy:pre", label: "pre-deploy", desc: "provision the server (Caddy + dirs)" },
  { key: "deploy", aliases: ["push"], rootSuffix: "deploy", label: "deploy", desc: "build locally + upload dist/" },
  { key: "all", aliases: [], rootSuffix: "deploy:all", label: "all", desc: "pre-deploy, then deploy" },
];
function resolveAction(token) {
  if (!token) return null;
  const t = token.toLowerCase();
  return ACTIONS.find((a) => a.key === t || a.aliases.includes(t)) ?? null;
}

// --- arg parsing ------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positionals = argv.filter((a) => !a.startsWith("--"));
const dryRun = flags.has("--dry-run");

const projects = discoverProjects();
if (projects.length === 0) die("No deployable projects found (need a sibling dir with a `deploy:push` script).");

if (flags.has("--list")) {
  console.log(paint("Deployable projects:", c.bold));
  for (const p of projects) {
    const note = p.hasRootScripts ? "" : paint("  (missing root <dir>:deploy* scripts)", c.yellow);
    console.log(`  ${paint(p.dir, c.cyan)}${note}`);
  }
  process.exit(0);
}

if (flags.has("--help") || flags.has("-h")) {
  printHelp();
  process.exit(0);
}

// --- interactive prompts (only when a positional is missing) ----------------
async function pick(promptLabel, items, render) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log(paint(promptLabel, c.bold));
    items.forEach((it, i) => console.log(`  ${paint(String(i + 1), c.cyan)}) ${render(it)}`));
    const ans = (await rl.question(paint("› choose [number]: ", c.dim))).trim();
    const idx = Number.parseInt(ans, 10) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= items.length) die(`Invalid choice: "${ans}".`);
    return items[idx];
  } finally {
    rl.close();
  }
}

let project = positionals[0] ? projects.find((p) => p.dir === positionals[0]) : null;
if (positionals[0] && !project) {
  die(`Unknown project "${positionals[0]}". Known: ${projects.map((p) => p.dir).join(", ")}.`);
}
let action = resolveAction(positionals[1]);
if (positionals[1] && !action) {
  die(`Unknown action "${positionals[1]}". Use: ${ACTIONS.map((a) => a.key).join(", ")}.`);
}

if (!project) {
  if (!isTTY) die("No project given and not a TTY. Pass it: npm run deploy -- <project> <action>.");
  project = await pick("Which project?", projects, (p) => p.dir + (p.hasRootScripts ? "" : paint(" (no root scripts)", c.yellow)));
}
if (!action) {
  if (!isTTY) die("No action given and not a TTY. Pass it: npm run deploy -- " + project.dir + " <action>.");
  action = await pick(`Action for ${paint(project.dir, c.cyan)}?`, ACTIONS, (a) => `${a.label} ${paint("— " + a.desc, c.dim)}`);
}

if (!project.hasRootScripts) {
  die(`Root package.json is missing the ${project.dir}:deploy* passthrough scripts. Add them (see another site for the pattern).`);
}

// --- run --------------------------------------------------------------------
const rootScript = `${project.dir}:${action.rootSuffix}`;
const npmArgs = ["run", rootScript];

step(`${paint(project.dir, c.cyan)} → ${paint(action.label, c.green)}  ${paint(`(npm run ${rootScript})`, c.dim)}`);

if (dryRun) {
  ok(`dry run — would execute: npm ${npmArgs.join(" ")}`);
  process.exit(0);
}

const res = spawnSync("npm", npmArgs, { cwd: ROOT, stdio: "inherit" });
if (res.error) die(`Failed to launch npm: ${res.error.message}`);
process.exit(res.status ?? 0);

// --- help -------------------------------------------------------------------
function printHelp() {
  console.log(`
${paint("Monorepo deploy CLI", c.bold)} — pick a project and action, delegate to its deploy script.

${paint("Usage", c.bold)}
  npm run deploy                      interactive (pick project, then action)
  npm run deploy -- <project>         pick the action for <project>
  npm run deploy -- <project> <action>
  npm run deploy -- --list            list deployable projects
  npm run deploy -- --help

${paint("Actions", c.bold)}
  pre-deploy | pre    provision the server (Caddy + dirs)
  deploy     | push   build locally + upload dist/
  all                 pre-deploy, then deploy

${paint("Flags", c.bold)}
  --dry-run   print the npm command instead of running it
  --list      list discovered deployable projects and exit

${paint("Projects", c.bold)} (auto-discovered)
  ${projects.map((p) => p.dir).join(", ")}
`);
}
