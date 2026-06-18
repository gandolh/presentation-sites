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
 *   npm run deploy -- all deploy      # deploy every project (one after another)
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
 *   --sudo-ask  prompt once for the server sudo password and pass it to every
 *               project (via env, not argv) so sudo steps run via `sudo -S`
 *
 * Projects are auto-discovered: any sibling directory whose package.json has a
 * `deploy:push` script is offered. Add a new site and it shows up here for free.
 */

import { readFileSync, readdirSync, existsSync, readSync } from "node:fs";
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
// --sudo-ask: prompt once for the server sudo password and pass it to every
// project (via env, not argv) so each delegates to `sudo -S` instead of printing
// the command for manual run. Type it once, even for `all`. When not passed and
// we're interactive, the CLI offers it as a choice below.
let sudoAsk = flags.has("--sudo-ask");

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

// Read a secret line from stdin with terminal echo disabled. `stty` is POSIX; if
// it's unavailable the read still works (just visible). Restores echo afterwards.
function promptPassword(question) {
  stdout.write(question);
  const tty = Boolean(stdin.isTTY);
  if (tty) spawnSync("stty", ["-echo"], { stdio: "inherit" });
  const buf = Buffer.alloc(256);
  let bytes = 0;
  try {
    bytes = readSync(0, buf, 0, buf.length, null);
  } catch {
    bytes = 0;
  } finally {
    if (tty) spawnSync("stty", ["echo"], { stdio: "inherit" });
    stdout.write("\n");
  }
  return buf.toString("utf8", 0, bytes).replace(/\r?\n$/, "");
}

// Build the env passed to each project's deploy subprocess. With --sudo-ask we
// prompt once and hand the password to every child via DEPLOY_SUDO_PASSWORD
// (never on argv) plus SUDO_ASKPASS=true so each script uses `sudo -S`.
let _childEnv = null;
function childEnv() {
  if (_childEnv) return _childEnv;
  if (!sudoAsk) return (_childEnv = process.env);
  if (!isTTY) die("--sudo-ask needs a TTY to read the password.");
  const pass = promptPassword("  [sudo] password for the server: ");
  if (!pass) die("Empty password — aborting.");
  _childEnv = { ...process.env, SUDO_ASKPASS: "true", DEPLOY_SUDO_PASSWORD: pass };
  return _childEnv;
}

// "all" (or --all) targets every discovered project rather than a single one.
// With the --all flag the project positional is omitted, so the action (if any)
// is the FIRST positional; with the bare `all` token it's the second.
const ALL = "all";
const allViaFlag = flags.has("--all");
const allViaToken = positionals[0]?.toLowerCase() === ALL;
const allProjects = allViaFlag || allViaToken;
const actionToken = allViaFlag ? positionals[0] : positionals[1];

let project = null;
if (!allProjects) {
  project = positionals[0] ? projects.find((p) => p.dir === positionals[0]) : null;
  if (positionals[0] && !project) {
    die(`Unknown project "${positionals[0]}". Known: ${ALL}, ${projects.map((p) => p.dir).join(", ")}.`);
  }
}
let action = resolveAction(actionToken);
if (actionToken && !action) {
  die(`Unknown action "${actionToken}". Use: ${ACTIONS.map((a) => a.key).join(", ")}.`);
}

let pickedAll = allProjects;
if (!allProjects && !project) {
  if (!isTTY) die("No project given and not a TTY. Pass it: npm run deploy -- <project|all> <action>.");
  const choices = [{ dir: ALL, hasRootScripts: true, isAll: true }, ...projects];
  const chosen = await pick("Which project?", choices, (p) =>
    p.isAll
      ? paint("all", c.cyan) + paint(" — every project, one after another", c.dim)
      : p.dir + (p.hasRootScripts ? "" : paint(" (no root scripts)", c.yellow)),
  );
  if (chosen.isAll) pickedAll = true;
  else project = chosen;
}
if (!action) {
  const label = pickedAll ? ALL : project.dir;
  if (!isTTY) die("No action given and not a TTY. Pass it: npm run deploy -- " + label + " <action>.");
  action = await pick(`Action for ${paint(label, c.cyan)}?`, ACTIONS, (a) => `${a.label} ${paint("— " + a.desc, c.dim)}`);
}

// Offer the sudo-password mode interactively, unless it was already requested via
// --sudo-ask. Only the server-provisioning actions need sudo, so skip the prompt
// for a plain `deploy` (build + upload), which never runs sudo.
if (!sudoAsk && isTTY && action.rootSuffix !== "deploy") {
  const SUDO_CHOICES = [
    { ask: false, label: "manual / .env", desc: "use each project's SUDO_* setting (print command if no passwordless sudo)" },
    { ask: true, label: "ask for password", desc: "prompt once now, pipe it to `sudo -S` on the server for every project" },
  ];
  const chosen = await pick("How should sudo run on the server?", SUDO_CHOICES, (s) => `${s.label} ${paint("— " + s.desc, c.dim)}`);
  sudoAsk = chosen.ask;
}

// Prime the sudo password (if --sudo-ask) once, before any project runs, so the
// prompt appears up front rather than interleaved with the first project's logs.
if (sudoAsk && !dryRun) childEnv();

if (pickedAll) {
  await runAll();
} else {
  process.exit(runOne(project, action));
}

// --- run --------------------------------------------------------------------
function runOne(proj, act) {
  if (!proj.hasRootScripts) {
    die(`Root package.json is missing the ${proj.dir}:deploy* passthrough scripts. Add them (see another site for the pattern).`);
  }
  const rootScript = `${proj.dir}:${act.rootSuffix}`;
  const npmArgs = ["run", rootScript];

  step(`${paint(proj.dir, c.cyan)} → ${paint(act.label, c.green)}  ${paint(`(npm run ${rootScript})`, c.dim)}`);

  if (dryRun) {
    ok(`dry run — would execute: npm ${npmArgs.join(" ")}`);
    return 0;
  }

  const res = spawnSync("npm", npmArgs, { cwd: ROOT, stdio: "inherit", env: childEnv() });
  if (res.error) die(`Failed to launch npm: ${res.error.message}`);
  return res.status ?? 0;
}

async function runAll() {
  const deployable = projects.filter((p) => p.hasRootScripts);
  const skipped = projects.filter((p) => !p.hasRootScripts);
  for (const p of skipped) {
    console.log(paint(`• skipping ${p.dir} (missing root <dir>:deploy* scripts)`, c.yellow));
  }
  if (deployable.length === 0) die("No projects with root deploy scripts to run.");

  step(`${paint(ALL, c.cyan)} → ${paint(action.label, c.green)}  ${paint(`(${deployable.length} projects)`, c.dim)}`);

  const failures = [];
  for (const p of deployable) {
    const status = runOne(p, action);
    if (status !== 0) {
      failures.push({ dir: p.dir, status });
      console.error(paint(`✗ ${p.dir} exited with status ${status} — continuing`, c.red));
    } else {
      ok(`${p.dir} done`);
    }
  }

  if (failures.length) {
    die(`${failures.length} project(s) failed: ${failures.map((f) => f.dir).join(", ")}.`);
  }
  ok(`all ${deployable.length} project(s) completed`);
  process.exit(0);
}

// --- help -------------------------------------------------------------------
function printHelp() {
  console.log(`
${paint("Monorepo deploy CLI", c.bold)} — pick a project and action, delegate to its deploy script.

${paint("Usage", c.bold)}
  npm run deploy                      interactive (pick project, then action)
  npm run deploy -- <project>         pick the action for <project>
  npm run deploy -- <project> <action>
  npm run deploy -- all <action>      run <action> for every project
  npm run deploy -- --all <action>    (same as 'all')
  npm run deploy -- all pre --sudo-ask  prompt once for the sudo password, reuse it for all
  npm run deploy -- --list            list deployable projects
  npm run deploy -- --help

${paint("Actions", c.bold)}
  pre-deploy | pre    provision the server (Caddy + dirs)
  deploy     | push   build locally + upload dist/
  all                 pre-deploy, then deploy

${paint("Flags", c.bold)}
  --dry-run    print the npm command instead of running it
  --list       list discovered deployable projects and exit
  --sudo-ask   prompt once for the server sudo password and pass it to every
               project (sets SUDO_ASKPASS=true), so sudo steps run via 'sudo -S'
               instead of printing the command for you to run by hand. When
               omitted, the interactive CLI offers this as a choice for the
               pre-deploy / all actions.

${paint("Projects", c.bold)} (auto-discovered)
  ${projects.map((p) => p.dir).join(", ")}
`);
}
