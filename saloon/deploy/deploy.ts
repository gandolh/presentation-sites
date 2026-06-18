#!/usr/bin/env node
/**
 * Ana Saloon deploy tool — zero dependencies, native Node TypeScript.
 *
 * Run with Node 22.6+ (uses built-in type stripping — no compile step):
 *
 *   node deploy/deploy.ts pre-deploy   # provision the server (Caddy + dirs)
 *   node deploy/deploy.ts deploy       # build locally + upload dist/
 *   node deploy/deploy.ts all          # pre-deploy then deploy
 *
 * Flags:
 *   --no-build   (deploy)  upload the existing dist/ without rebuilding
 *   --dry-run               print actions without touching the server
 *
 * Config comes from deploy/.env (copy deploy/.env.example). No secrets are
 * hard-coded; SSH auth uses your key / ~/.ssh/config exactly like plain ssh.
 *
 * The site is a STATIC build served by Caddy — there is no Node runtime on the
 * server, so pre-deploy only ensures Caddy + the served directory, never pm2.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, readSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

// --- Paths ------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, "..");
const ENV_FILE = join(HERE, ".env");
// Shared master Caddyfile (all routes) lives at <repo>/infrastructure/Caddyfile,
// one copy for every site, so there's no per-site drift. PROJECT_ROOT is the
// site dir; its parent is the monorepo root.
const CADDYFILE = resolve(PROJECT_ROOT, "..", "infrastructure", "Caddyfile");
const DIST_DIR = join(PROJECT_ROOT, "dist");

// --- Tiny terminal helpers --------------------------------------------------
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};
const step = (m: string) => console.log(`${c.cyan}▸${c.reset} ${m}`);
const ok = (m: string) => console.log(`${c.green}✓${c.reset} ${m}`);
const warn = (m: string) => console.log(`${c.yellow}!${c.reset} ${m}`);
const info = (m: string) => console.log(`  ${c.dim}${m}${c.reset}`);
function die(m: string): never {
  console.error(`${c.red}✗ ${m}${c.reset}`);
  process.exit(1);
}

// --- Minimal .env parser (no dotenv dependency) -----------------------------
type Env = Record<string, string>;
function loadEnv(path: string): Env {
  if (!existsSync(path)) {
    die(
      `Missing ${path}\n  Copy deploy/.env.example → deploy/.env and fill it in.`,
    );
  }
  const env: Env = {};
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) env[key] = val;
  }
  return env;
}

function required(env: Env, key: string): string {
  const v = env[key];
  if (!v) die(`Missing required key "${key}" in deploy/.env`);
  return v;
}

// --- Config -----------------------------------------------------------------
interface Config {
  sshHost: string;
  sshArgs: string[]; // extra ssh args (port, key, user@hostname override)
  sshTarget: string; // the host token passed to ssh/scp/rsync
  basePath: string;
  remoteDir: string;
  publicUrl: string;
  remoteCaddyfile: string;
  sudoNoPasswd: boolean;
  sudoAskpass: boolean;
}

function buildConfig(env: Env): Config {
  const sshHost = required(env, "SSH_HOST");
  const sshArgs: string[] = [];

  // Explicit connection overrides win over the ~/.ssh/config alias.
  const user = env.SSH_USER;
  const hostname = env.SSH_HOSTNAME;
  const sshTarget = user && hostname ? `${user}@${hostname}` : sshHost;

  if (env.SSH_PORT) sshArgs.push("-p", env.SSH_PORT);
  if (env.SSH_KEY) sshArgs.push("-i", expandHome(env.SSH_KEY));

  return {
    sshHost,
    sshArgs,
    sshTarget,
    basePath: required(env, "BASE_PATH"),
    remoteDir: required(env, "REMOTE_DIR"),
    publicUrl: env.PUBLIC_URL || "",
    remoteCaddyfile: env.REMOTE_CADDYFILE || "/etc/caddy/Caddyfile",
    // process.env wins over deploy/.env for the sudo switches, so the monorepo
    // runner's `--sudo-ask` (which exports SUDO_ASKPASS) and ad-hoc shell
    // overrides take effect without editing the file.
    sudoNoPasswd: ((process.env.SUDO_NOPASSWD ?? env.SUDO_NOPASSWD) || "false").toLowerCase() === "true",
    sudoAskpass: ((process.env.SUDO_ASKPASS ?? env.SUDO_ASKPASS) || "false").toLowerCase() === "true",
  };
}

function expandHome(p: string): string {
  return p.startsWith("~") ? join(process.env.HOME || "", p.slice(1)) : p;
}

// --- Command runner ---------------------------------------------------------
let DRY_RUN = false;

function run(
  cmd: string,
  args: string[],
  opts: { cwd?: string; allowFail?: boolean; quiet?: boolean } = {},
): { code: number; stdout: string } {
  const pretty = `${cmd} ${args.join(" ")}`;
  if (DRY_RUN) {
    info(`[dry-run] ${pretty}`);
    return { code: 0, stdout: "" };
  }
  if (!opts.quiet) info(pretty);
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? PROJECT_ROOT,
    stdio: opts.quiet ? ["inherit", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
  });
  if (res.error) {
    if (opts.allowFail) return { code: 1, stdout: "" };
    die(`Failed to run: ${pretty}\n  ${res.error.message}`);
  }
  const code = res.status ?? 1;
  if (code !== 0 && !opts.allowFail) {
    die(`Command exited ${code}: ${pretty}`);
  }
  return { code, stdout: (res.stdout as string) || "" };
}

// ssh wrapper: runs a remote command and returns its output.
function ssh(
  cfg: Config,
  remoteCmd: string,
  opts: { allowFail?: boolean; quiet?: boolean } = {},
) {
  return run("ssh", [...cfg.sshArgs, cfg.sshTarget, remoteCmd], opts);
}

// Returns true if the remote shell command succeeds (exit 0).
function sshTest(cfg: Config, remoteCmd: string): boolean {
  if (DRY_RUN) {
    info(`[dry-run] ssh test: ${remoteCmd}`);
    return true;
  }
  const res = spawnSync("ssh", [...cfg.sshArgs, cfg.sshTarget, remoteCmd], {
    stdio: ["inherit", "pipe", "pipe"],
    encoding: "utf8",
  });
  return (res.status ?? 1) === 0;
}

// The login user on the server (a non-sudo `whoami`), so we can chown the served
// dir to whoever rsync connects as. Falls back to "$(whoami)" in dry-run.
function remoteLoginUser(cfg: Config): string {
  if (DRY_RUN) return "$(whoami)";
  const res = spawnSync("ssh", [...cfg.sshArgs, cfg.sshTarget, "whoami"], {
    stdio: ["inherit", "pipe", "pipe"],
    encoding: "utf8",
  });
  const user = (res.stdout as string | undefined)?.trim();
  if ((res.status ?? 1) !== 0 || !user) {
    die(`Could not determine the remote login user (whoami failed on ${cfg.sshTarget}).`);
  }
  return user;
}

// =============================================================================
// PRE-DEPLOY PHASE — provision the server
// =============================================================================
function preDeploy(cfg: Config) {
  console.log(`\n${c.bold}=== Pre-deploy: provision server ===${c.reset}\n`);

  // 1. Connectivity check.
  step("Checking SSH connectivity ...");
  if (!sshTest(cfg, "true")) {
    die(
      `Cannot reach ${cfg.sshTarget} over SSH.\n  Check SSH_HOST/SSH_KEY in deploy/.env and your ~/.ssh/config.`,
    );
  }
  ok(`Reachable: ${cfg.sshTarget}`);

  // 2. Ensure Caddy is installed.
  step("Ensuring Caddy is installed ...");
  if (sshTest(cfg, "command -v caddy >/dev/null 2>&1")) {
    ok("Caddy already installed.");
  } else {
    warn("Caddy not found on the server.");
    installCaddy(cfg);
  }

  // 3. Ensure the served directory exists with sane ownership.
  step(`Ensuring remote dir ${cfg.remoteDir} exists ...`);
  // User dirs under /var/www usually need sudo to create; chown to the ssh user
  // so rsync (running as that user) can write without sudo.
  const mkdir = `mkdir -p ${shq(cfg.remoteDir)}`;
  if (sshTest(cfg, `test -w "$(dirname ${shq(cfg.remoteDir)})"`)) {
    ssh(cfg, mkdir);
  } else {
    // Resolve the login user with a NON-sudo `whoami` and bake it in literally:
    // inside `sudo sh -c '...'` a bare $(whoami) would expand to root, leaving the
    // dir root-owned and unwritable by rsync (which connects as the login user).
    const user = remoteLoginUser(cfg);
    sudoRemote(
      cfg,
      `mkdir -p ${shq(cfg.remoteDir)} && chown -R ${shq(user)} ${shq(cfg.remoteDir)}`,
      `create ${cfg.remoteDir} and hand it to ${user}`,
    );
  }
  ok(`Remote dir ready: ${cfg.remoteDir}`);

  // 4. Sync the Caddyfile and reload Caddy.
  step("Updating Caddy configuration ...");
  syncCaddyfile(cfg);

  console.log(`\n${c.green}✓ Pre-deploy complete.${c.reset}\n`);
}

function installCaddy(cfg: Config) {
  // Official Debian/Ubuntu install (Caddy apt repo).
  const cmds = [
    "apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl",
    "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg",
    "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list",
    "apt-get update",
    "apt-get install -y caddy",
  ].join(" && ");
  sudoRemote(cfg, cmds, "install Caddy via its official apt repository");
}

function syncCaddyfile(cfg: Config) {
  if (!existsSync(CADDYFILE)) {
    die(`Missing ${CADDYFILE} — cannot configure Caddy.`);
  }
  // Upload to a temp path the ssh user can write, then move into place + reload.
  const tmp = "/tmp/Caddyfile.ana-saloon";
  run("scp", [
    ...sshArgsForScp(cfg),
    CADDYFILE,
    `${cfg.sshTarget}:${tmp}`,
  ]);

  const apply = [
    `cp ${tmp} ${shq(cfg.remoteCaddyfile)}`,
    `rm -f ${tmp}`,
    `caddy validate --config ${shq(cfg.remoteCaddyfile)}`,
    "systemctl reload caddy",
  ].join(" && ");
  sudoRemote(
    cfg,
    apply,
    `install Caddyfile → ${cfg.remoteCaddyfile}, validate, and reload Caddy`,
  );
  ok("Caddy configured and reloaded.");
}

// Run a command on the server with sudo. Three modes, in priority order:
//   SUDO_NOPASSWD=true  → run via `sudo` (assumes passwordless sudo).
//   SUDO_ASKPASS=true   → prompt once for the sudo password and pipe it to
//                         `sudo -S` over ssh (the password never appears in argv
//                         or in any printed command).
//   otherwise           → print the exact command for the user to run by hand.
function sudoRemote(cfg: Config, remoteCmd: string, label: string) {
  if (cfg.sudoNoPasswd) {
    ssh(cfg, `sudo sh -c ${shq(remoteCmd)}`);
    return;
  }
  if (cfg.sudoAskpass) {
    runSudoWithPassword(cfg, remoteCmd, label);
    return;
  }
  warn(`Needs sudo on the server to: ${label}`);
  info("SUDO_NOPASSWD is false, so run this on the server yourself:");
  console.log(
    `\n  ${c.bold}sudo sh -c "${remoteCmd.replace(/"/g, '\\"')}"${c.reset}\n`,
  );
  if (!DRY_RUN) {
    const ans = promptYesNo("Have you run it (or is it already done)? [y/N] ");
    if (!ans) die("Aborted — re-run pre-deploy after provisioning.");
  }
}

// Pipe the cached sudo password to `sudo -S` on the server. `-p ""` silences the
// remote prompt; the password is the first line on stdin, the command runs after.
function runSudoWithPassword(cfg: Config, remoteCmd: string, label: string) {
  if (DRY_RUN) {
    info(`[dry-run] ssh ${cfg.sshTarget} sudo -S sh -c ${shq(remoteCmd)}  (${label})`);
    return;
  }
  const pass = getSudoPassword();
  info(`sudo (with password) on ${cfg.sshTarget}: ${label}`);
  const remote = `sudo -S -p "" sh -c ${shq(remoteCmd)}`;
  const res = spawnSync("ssh", [...cfg.sshArgs, cfg.sshTarget, remote], {
    input: pass + "\n",
    stdio: ["pipe", "inherit", "inherit"],
    encoding: "utf8",
  });
  if (res.error) die(`Failed to run sudo over ssh: ${res.error.message}`);
  if ((res.status ?? 1) !== 0) {
    die(`Remote sudo command failed (exit ${res.status}) — wrong password or sudo denied?`);
  }
}

// =============================================================================
// DEPLOY PHASE — build locally, upload dist/
// =============================================================================
function deploy(cfg: Config, opts: { build: boolean }) {
  console.log(`\n${c.bold}=== Deploy: build + upload ===${c.reset}\n`);

  if (opts.build) {
    step(`Building (PUBLIC_BASE=${cfg.basePath}, real photos) ...`);
    // Production ships the salon's real photos, not the SVG mockups. Names
    // without a real file still fall back to mocks (see src/content/images.ts).
    const prevSrc = process.env.PUBLIC_IMAGE_SOURCE;
    process.env.PUBLIC_IMAGE_SOURCE = "real";
    try {
      run("npm", ["run", "build"], {
        cwd: PROJECT_ROOT,
        // Inject the sub-path base for this build only.
      });
    } finally {
      if (prevSrc === undefined) delete process.env.PUBLIC_IMAGE_SOURCE;
      else process.env.PUBLIC_IMAGE_SOURCE = prevSrc;
    }
  } else {
    warn("Skipping build (--no-build); uploading existing dist/.");
  }

  if (!existsSync(DIST_DIR)) {
    die("dist/ not found — run without --no-build first.");
  }

  step("Verifying remote dir exists ...");
  ssh(cfg, `mkdir -p ${shq(cfg.remoteDir)}`);

  step(`Syncing dist/ → ${cfg.sshTarget}:${cfg.remoteDir} ...`);
  // Trailing slash on dist/ uploads the CONTENTS. --delete keeps the remote an
  // exact mirror (removes stale files). -z compresses over the wire.
  const rsyncArgs = [
    "-avz",
    "--delete",
    ...rsyncSshOpt(cfg),
    `${DIST_DIR}/`,
    `${cfg.sshTarget}:${cfg.remoteDir}/`,
  ];
  run("rsync", rsyncArgs);

  ok("Deployed.");
  if (cfg.publicUrl) info(`Live at ${cfg.publicUrl}`);
  console.log(`\n${c.green}✓ Deploy complete.${c.reset}\n`);
}

// The build step needs PUBLIC_BASE in the environment. spawnSync inherits
// process.env, so set it before the npm run build call.
function withBaseEnv(basePath: string, fn: () => void) {
  const prev = process.env.PUBLIC_BASE;
  process.env.PUBLIC_BASE = basePath;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.PUBLIC_BASE;
    else process.env.PUBLIC_BASE = prev;
  }
}

// --- SSH option plumbing for scp / rsync ------------------------------------
function sshArgsForScp(cfg: Config): string[] {
  // scp uses -P (capital) for port, unlike ssh's -p.
  const args: string[] = [];
  const portIdx = cfg.sshArgs.indexOf("-p");
  if (portIdx !== -1) args.push("-P", cfg.sshArgs[portIdx + 1]);
  const keyIdx = cfg.sshArgs.indexOf("-i");
  if (keyIdx !== -1) args.push("-i", cfg.sshArgs[keyIdx + 1]);
  return args;
}

function rsyncSshOpt(cfg: Config): string[] {
  if (cfg.sshArgs.length === 0) return [];
  // rsync needs the ssh options bundled into a single -e value.
  return ["-e", `ssh ${cfg.sshArgs.join(" ")}`];
}

// --- shell quoting + tiny synchronous prompt --------------------------------
// Single-quote a string for safe interpolation into a remote sh command.
function shq(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

// Read a secret line from stdin with terminal echo disabled, so the password is
// not shown as it's typed. `stty` is POSIX; if it's unavailable the read still
// works (just visible). Restores echo afterwards.
function promptPassword(question: string): string {
  process.stdout.write(question);
  const tty = Boolean(process.stdin.isTTY);
  if (tty) spawnSync("stty", ["-echo"], { stdio: "inherit" });
  const buf = Buffer.alloc(256);
  let bytes = 0;
  try {
    bytes = readSync(0, buf, 0, buf.length, null);
  } catch {
    bytes = 0;
  } finally {
    if (tty) spawnSync("stty", ["echo"], { stdio: "inherit" });
    process.stdout.write("\n");
  }
  return buf.toString("utf8", 0, bytes).replace(/\r?\n$/, "");
}

// Sudo password for this run, fetched once. The monorepo runner may pass it via
// DEPLOY_SUDO_PASSWORD so you only type it once across all projects; otherwise
// it's prompted on first use and cached for the rest of the run.
let _sudoPassword: string | null = null;
function getSudoPassword(): string {
  if (_sudoPassword !== null) return _sudoPassword;
  const fromEnv = process.env.DEPLOY_SUDO_PASSWORD;
  _sudoPassword =
    fromEnv != null && fromEnv !== ""
      ? fromEnv
      : promptPassword("  [sudo] password for the server: ");
  return _sudoPassword;
}

function promptYesNo(question: string): boolean {
  process.stdout.write(question);
  // Synchronous single-line read from stdin (fd 0) — keeps the tool dependency
  // free and avoids async plumbing in an otherwise linear script.
  const buf = Buffer.alloc(64);
  let bytes = 0;
  try {
    bytes = readSync(0, buf, 0, buf.length, null);
  } catch {
    return false;
  }
  const ans = buf.toString("utf8", 0, bytes).trim().toLowerCase();
  return ans === "y" || ans === "yes";
}

// =============================================================================
// CLI
// =============================================================================
function main() {
  const argv = process.argv.slice(2);
  const phase = argv.find((a) => !a.startsWith("-")) || "all";
  DRY_RUN = argv.includes("--dry-run");
  const noBuild = argv.includes("--no-build");

  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return;
  }

  const env = loadEnv(ENV_FILE);
  const cfg = buildConfig(env);

  if (DRY_RUN) warn("DRY RUN — no changes will be made.\n");

  switch (phase) {
    case "pre-deploy":
      preDeploy(cfg);
      break;
    case "deploy":
      withBaseEnv(cfg.basePath, () => deploy(cfg, { build: !noBuild }));
      break;
    case "all":
      preDeploy(cfg);
      withBaseEnv(cfg.basePath, () => deploy(cfg, { build: !noBuild }));
      break;
    default:
      die(`Unknown phase "${phase}". Use pre-deploy | deploy | all (--help).`);
  }
}

function printHelp() {
  console.log(`
${c.bold}Ana Saloon deploy${c.reset} — zero-dependency Node TypeScript deploy tool.

${c.bold}Usage${c.reset}
  node deploy/deploy.ts <phase> [flags]

${c.bold}Phases${c.reset}
  pre-deploy   Provision the server: check SSH, ensure Caddy is installed,
               ensure ${c.dim}REMOTE_DIR${c.reset} exists, sync the Caddyfile, reload Caddy.
  deploy       Build the site locally with the sub-path base, then rsync
               dist/ to the server (exact mirror).
  all          pre-deploy, then deploy. (default)

${c.bold}Flags${c.reset}
  --no-build   Deploy the existing dist/ without rebuilding.
  --dry-run    Print every action without touching the server.
  -h, --help   This help.

${c.bold}Config${c.reset}
  Reads ${c.dim}deploy/.env${c.reset} (copy from deploy/.env.example). No secrets in code.
`);
}

main();
