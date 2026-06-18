#!/usr/bin/env node
/**
 * deploy.ts — zero-dependency deploy tool for Churchix static (Astro SSG) sites.
 *
 * Runs on Node ≥ 22 with native TypeScript type-stripping and `--env-file`.
 * No npm dependencies: only `node:*` built-ins and the `ssh`/`rsync` CLIs.
 *
 * Config comes from .env (see .env.example). Run via the npm scripts:
 *
 *   npm run pre-deploy     # one-time server prep: ensure REMOTE_DIR + Caddy route, reload Caddy
 *   npm run deploy         # build the app locally and upload dist/ to the server
 *
 * Or directly:
 *
 *   node --env-file=.env scripts/deploy.ts <command>
 *
 * Commands:
 *   pre-deploy   Prepare the server (idempotent): create the served dir, insert a
 *                Caddy handle_path route for the app if absent, validate + reload.
 *   deploy       Build the app locally (with the correct base path) and rsync the
 *                dist/ to the server, mirroring it into REMOTE_DIR.
 *
 * Config schema is shared with the other sites in this monorepo (see any
 * sibling deploy/.env): SSH_HOST, BASE_PATH, REMOTE_DIR, PUBLIC_URL,
 * REMOTE_CADDYFILE, SUDO_NOPASSWD. WEB_OWNER and APP_SLUG are churchix-only.
 *
 * Requirements (must already be in place):
 *   - `ssh "$SSH_HOST"` works (alias in ~/.ssh/config, or user@host)
 *   - Caddy installed on the server with a Caddyfile at REMOTE_CADDYFILE
 *   - rsync available locally and on the server
 *   - sudo on the server (passwordless if SUDO_NOPASSWD=true; otherwise the tool
 *     prints the exact command for you to run by hand)
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- pretty output ------------------------------------------------------------

const c = {
  cyan: (s: string) => `\x1b[1;36m${s}\x1b[0m`,
  red: (s: string) => `\x1b[1;31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[1;33m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const log = (msg: string) => console.log(`${c.cyan('==>')} ${msg}`);
const warn = (msg: string) => console.error(`${c.yellow('WARN:')} ${msg}`);
const fail = (msg: string): never => {
  console.error(`${c.red('ERROR:')} ${msg}`);
  process.exit(1);
};

// --- config -------------------------------------------------------------------

interface Config {
  sshHost: string;
  basePath: string; // URL sub-path with leading slash, e.g. "/churchix" or "/"
  urlPath: string; // basePath without surrounding slashes, e.g. "churchix" or ""
  remoteDir: string; // absolute served dir on the server, e.g. /var/www/churchix
  publicUrl: string;
  remoteCaddyfile: string;
  webOwner: string; // server user:group that should own published files
  appSlug: string; // workspace under apps/ to build
  sudoNoPasswd: boolean;
  sudoAskpass: boolean;
}

function loadConfig(): Config {
  const env = process.env;
  const required = (key: string): string => {
    const v = env[key]?.trim();
    if (!v) {
      fail(
        `Missing ${key}. Copy .env.example to .env and fill it in, then run via ` +
          `the npm scripts (\`npm run pre-deploy\` / \`npm run deploy\`).`,
      );
    }
    return v!;
  };

  const basePathRaw = required('BASE_PATH');
  const basePath = '/' + basePathRaw.trim().replace(/^\/+|\/+$/g, '');
  const urlPath = basePath.replace(/^\/+|\/+$/g, ''); // "" when basePath is "/"

  return {
    sshHost: required('SSH_HOST'),
    basePath: urlPath ? `/${urlPath}` : '/',
    urlPath,
    remoteDir: required('REMOTE_DIR').replace(/\/+$/, ''),
    publicUrl: env.PUBLIC_URL?.trim() || '',
    remoteCaddyfile: env.REMOTE_CADDYFILE?.trim() || '/etc/caddy/Caddyfile',
    webOwner: env.WEB_OWNER?.trim() || 'caddy:caddy',
    appSlug: env.APP_SLUG?.trim() || required('APP_SLUG'),
    sudoNoPasswd: (env.SUDO_NOPASSWD || 'false').toLowerCase() === 'true',
    sudoAskpass: (env.SUDO_ASKPASS || 'false').toLowerCase() === 'true',
  };
}

// --- shell helpers ------------------------------------------------------------

/** Run a command locally, inheriting stdio. Exits the process on failure. */
function run(cmd: string, cmdArgs: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): void {
  const res = spawnSync(cmd, cmdArgs, {
    cwd: opts.cwd ?? REPO_ROOT,
    env: opts.env ?? process.env,
    stdio: 'inherit',
  });
  if (res.error) fail(`Failed to run ${cmd}: ${res.error.message}`);
  if (res.status !== 0) fail(`${cmd} exited with code ${res.status}`);
}

/** Run a command locally and capture stdout (trimmed). */
function capture(cmd: string, cmdArgs: string[]): string {
  const res = spawnSync(cmd, cmdArgs, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (res.error || res.status !== 0) return '';
  return res.stdout.trim();
}

/** Run a non-privileged script on the server over ssh. */
function ssh(cfg: Config, script: string): void {
  run('ssh', [cfg.sshHost, script]);
}

/** Single-quote a string for safe use inside a POSIX shell. */
function shq(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

/**
 * Run a privileged (sudo) script on the server. Three modes, in priority order:
 *   SUDO_NOPASSWD=true  → run via `sudo` over ssh with a PTY (passwordless sudo).
 *   SUDO_ASKPASS=true   → prompt once for the sudo password and pipe it to
 *                         `sudo -S` over ssh (never in argv or any printed line).
 *   otherwise           → print the exact command for the user to run by hand.
 */
function sudoRemote(cfg: Config, script: string, label: string): void {
  // The remote script uses bash-only ANSI-C quoting ($'...\t...'), so run it
  // under bash, NOT sh (dash on Debian doesn't support $'...').
  if (cfg.sudoNoPasswd) {
    run('ssh', ['-t', cfg.sshHost, `sudo bash -c ${shq(script)}`]);
    return;
  }
  if (cfg.sudoAskpass) {
    const pass = getSudoPassword();
    log(`sudo (with password) on ${cfg.sshHost}: ${label}`);
    const res = spawnSync('ssh', [cfg.sshHost, `sudo -S -p "" bash -c ${shq(script)}`], {
      input: pass + '\n',
      stdio: ['pipe', 'inherit', 'inherit'],
      encoding: 'utf8',
    });
    if (res.error) fail(`Failed to run sudo over ssh: ${res.error.message}`);
    if ((res.status ?? 1) !== 0) {
      fail(`Remote sudo command failed (exit ${res.status}) — wrong password or sudo denied?`);
    }
    return;
  }
  warn(`Needs sudo on the server to: ${label}`);
  log('SUDO_NOPASSWD is false, so run this on the server yourself:');
  console.log(`\n  ${c.bold(`sudo bash -c "${script.replace(/"/g, '\\"')}"`)}\n`);
  const ans = promptYesNo('Have you run it (or is it already done)? [y/N] ');
  if (!ans) fail('Aborted — re-run after provisioning.');
}

/** Block for a yes/no answer on the controlling TTY. Defaults to "no". */
function promptYesNo(question: string): boolean {
  process.stdout.write(question);
  const buf = Buffer.alloc(256);
  let bytes = 0;
  try {
    bytes = readSync(0, buf, 0, 256, null);
  } catch {
    return false;
  }
  const ans = buf.toString('utf8', 0, bytes).trim().toLowerCase();
  return ans === 'y' || ans === 'yes';
}

// Read a secret line from stdin with terminal echo disabled. `stty` is POSIX; if
// unavailable the read still works (just visible). Restores echo afterwards.
function promptPassword(question: string): string {
  process.stdout.write(question);
  const tty = Boolean(process.stdin.isTTY);
  if (tty) spawnSync('stty', ['-echo'], { stdio: 'inherit' });
  const buf = Buffer.alloc(256);
  let bytes = 0;
  try {
    bytes = readSync(0, buf, 0, 256, null);
  } catch {
    bytes = 0;
  } finally {
    if (tty) spawnSync('stty', ['echo'], { stdio: 'inherit' });
    process.stdout.write('\n');
  }
  return buf.toString('utf8', 0, bytes).replace(/\r?\n$/, '');
}

// Sudo password for this run, fetched once. The monorepo runner may pass it via
// DEPLOY_SUDO_PASSWORD so you only type it once across all projects; otherwise
// it's prompted on first use and cached for the rest of the run.
let _sudoPassword: string | null = null;
function getSudoPassword(): string {
  if (_sudoPassword !== null) return _sudoPassword;
  const fromEnv = process.env.DEPLOY_SUDO_PASSWORD;
  _sudoPassword =
    fromEnv != null && fromEnv !== '' ? fromEnv : promptPassword('  [sudo] password for the server: ');
  return _sudoPassword;
}

// --- commands -----------------------------------------------------------------

function build(cfg: Config): string {
  const appDir = join(REPO_ROOT, 'apps', cfg.appSlug);
  if (!existsSync(appDir)) fail(`App not found: apps/${cfg.appSlug}`);

  log('Installing workspaces (npm ci)…');
  run('npm', ['ci']);

  log(`Building apps/${cfg.appSlug} (base=${cfg.basePath}) …`);
  // BASE_PATH makes Astro emit asset URLs under the sub-path so they match
  // Caddy's handle_path route instead of 404ing at the server root.
  run('npm', ['run', 'build', '-w', `apps/${cfg.appSlug}`], {
    env: { ...process.env, BASE_PATH: cfg.basePath },
  });

  const distDir = join(appDir, 'dist');
  if (!existsSync(distDir)) fail(`Build produced no dist/ at ${distDir}`);
  if (!existsSync(join(distDir, 'index.html'))) {
    fail(`No index.html in ${distDir} — is this a static (SSG) build?`);
  }
  return distDir;
}

function deploy(cfg: Config): void {
  const distDir = build(cfg);
  // rsync resolves "host:relpath" against the remote $HOME. Don't prefix $HOME —
  // the local shell would expand it to the local home.
  const stagingRel = `.churchix-deploy/${cfg.appSlug}`;

  log(`Uploading build to ${cfg.sshHost}:~/${stagingRel} …`);
  ssh(cfg, `mkdir -p ~/${stagingRel}`);
  run('rsync', ['-az', '--delete', '-e', 'ssh', `${distDir}/`, `${cfg.sshHost}:${stagingRel}/`]);

  // The staging dir lives in the LOGIN user's home. The publish step runs under
  // sudo, where $HOME is /root — so resolve the absolute path with a non-sudo
  // shell and bake it in literally rather than relying on $HOME inside sudo.
  const remoteHome = capture('ssh', [cfg.sshHost, 'echo "$HOME"']);
  if (!remoteHome) fail(`Could not resolve the remote home dir on ${cfg.sshHost}.`);
  const staging = `${remoteHome}/${stagingRel}`;

  log(`Publishing to ${cfg.remoteDir} (sudo on server)…`);
  sudoRemote(
    cfg,
    [
      'set -e',
      `mkdir -p ${shq(cfg.remoteDir)}`,
      `rsync -a --delete ${shq(staging + '/')} ${shq(cfg.remoteDir + '/')}`,
      `chown -R ${cfg.webOwner} ${shq(cfg.remoteDir)} 2>/dev/null || chown -R root:root ${shq(cfg.remoteDir)}`,
    ].join('\n'),
    `publish the build into ${cfg.remoteDir}`,
  );

  report(cfg);
}

function preDeploy(cfg: Config): void {
  const owner = cfg.webOwner.split(':')[0] ?? 'caddy';

  log(`Preparing server: dir ${cfg.remoteDir} + Caddy route /${cfg.urlPath}/ …`);

  // Idempotent: create the served dir, and only insert a handle_path block for
  // this url-path if one is absent. Mirrors the Astro SSG try_files convention.
  const remoteScript = `
set -e
mkdir -p ${shq(cfg.remoteDir)}
chown -R ${owner}:${owner} ${shq(cfg.remoteDir)} 2>/dev/null || true

if grep -q 'handle_path /${cfg.urlPath}/\\*' ${shq(cfg.remoteCaddyfile)}; then
  echo 'Caddy route already present, leaving Caddyfile unchanged.'
else
  echo 'Inserting handle_path block before the final handle {} fallback.'
  BLOCK=$'\\t# --- ${cfg.appSlug} -> /${cfg.urlPath} ---\\n\\thandle_path /${cfg.urlPath}/* {\\n\\t\\troot * ${cfg.remoteDir}\\n\\t\\ttry_files {path} {path}/ {path}.html\\n\\t\\tfile_server\\n\\t}\\n'
  cp ${shq(cfg.remoteCaddyfile)} ${shq(cfg.remoteCaddyfile + '.bak')}
  awk -v block="$BLOCK" '
    !done && /^[[:space:]]*handle[[:space:]]*\\{/ { printf "%s\\n", block; done=1 }
    { print }
  ' ${shq(cfg.remoteCaddyfile + '.bak')} | tee ${shq(cfg.remoteCaddyfile)} >/dev/null
fi

echo 'Validating Caddyfile…'
caddy validate --config ${shq(cfg.remoteCaddyfile)}
echo 'Reloading Caddy…'
systemctl reload caddy
`;
  sudoRemote(cfg, remoteScript, `create ${cfg.remoteDir}, add the Caddy route, validate + reload Caddy`);
  log('Server prepared. Run `npm run deploy` to publish the build.');
}

function report(cfg: Config): void {
  let url = cfg.publicUrl;
  if (!url) {
    const ip = capture('ssh', ['-G', cfg.sshHost])
      .split('\n')
      .find((l) => l.startsWith('hostname '))
      ?.slice('hostname '.length)
      .trim();
    const host = ip || cfg.sshHost;
    url = cfg.urlPath ? `http://${host}/${cfg.urlPath}/` : `http://${host}/`;
  }
  log('Deployed.');
  console.log(`    apps/${cfg.appSlug}  →  ${url}`);
  console.log(c.dim(`    Published to ${cfg.sshHost}:${cfg.remoteDir}`));
}

// --- entry --------------------------------------------------------------------

const [command] = process.argv.slice(2);

if (!command || command === '-h' || command === '--help') {
  console.log(
    [
      'Usage: node --env-file=.env scripts/deploy.ts <command>',
      '',
      'Commands:',
      '  pre-deploy   Prepare the server: REMOTE_DIR + Caddy route, validate, reload.',
      '  deploy       Build the app locally and upload dist/ to the server.',
      '',
      'Config comes from .env (see .env.example) — shared schema with the other sites.',
    ].join('\n'),
  );
  process.exit(command ? 0 : 1);
}

const cfg = loadConfig();

switch (command) {
  case 'pre-deploy':
    preDeploy(cfg);
    break;
  case 'deploy':
    deploy(cfg);
    break;
  default:
    fail(`Unknown command: ${command}. Use \`pre-deploy\` or \`deploy\` (see --help).`);
}
