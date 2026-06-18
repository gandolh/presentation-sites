#!/usr/bin/env node
/**
 * deploy.ts — zero-dependency deploy tool for Churchix static (Astro SSG) sites.
 *
 * Runs on Node ≥ 22 with native TypeScript type-stripping and `--env-file`.
 * No npm dependencies: only `node:*` built-ins and the `ssh`/`rsync` CLIs.
 *
 * Config comes from .env (see .env.example). Run via the npm scripts:
 *
 *   npm run pre-deploy     # one-time server prep: ensure WEBROOT + Caddy route, reload Caddy
 *   npm run deploy         # build the app locally and upload dist/ to the server
 *
 * Or directly:
 *
 *   node --env-file=.env scripts/deploy.ts <command> [app-slug] [url-path]
 *
 * Commands:
 *   pre-deploy   Prepare the server (idempotent): create the webroot, insert a
 *                Caddy handle_path route for the app if absent, validate + reload.
 *   deploy       Build apps/<slug> locally (with the correct base path) and rsync
 *                the dist/ to the server, mirroring it into WEBROOT/<slug>.
 *
 * Positional args override .env (APP_SLUG, URL_PATH) for one-off deploys.
 *
 * Requirements (must already be in place):
 *   - `ssh "$SSH_HOST"` works (alias in ~/.ssh/config, or user@host)
 *   - Caddy installed on the server with a Caddyfile at CADDYFILE
 *   - the deploy user can sudo on the server (it will prompt for the password)
 *   - rsync available locally and on the server
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// --- pretty output ------------------------------------------------------------

const c = {
  cyan: (s: string) => `\x1b[1;36m${s}\x1b[0m`,
  red: (s: string) => `\x1b[1;31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const log = (msg: string) => console.log(`${c.cyan('==>')} ${msg}`);
const fail = (msg: string): never => {
  console.error(`${c.red('ERROR:')} ${msg}`);
  process.exit(1);
};

// --- config -------------------------------------------------------------------

interface Config {
  sshHost: string;
  webroot: string;
  caddyfile: string;
  webOwner: string;
  appSlug: string;
  urlPath: string;
}

function loadConfig(args: string[]): Config {
  const env = process.env;
  const required = (key: string): string => {
    const v = env[key]?.trim();
    if (!v) {
      fail(
        `Missing ${key}. Copy .env.example to .env and fill it in, then run with ` +
          `\`node --env-file=.env scripts/deploy.ts …\` (the npm scripts do this for you).`,
      );
    }
    return v!;
  };

  const appSlug = args[0]?.trim() || required('APP_SLUG');
  // URL_PATH defaults to the slug; positional arg or env can override. "" = root.
  const urlPathRaw = args[1] ?? env.URL_PATH ?? appSlug;
  const urlPath = urlPathRaw.trim().replace(/^\/+|\/+$/g, '');

  return {
    sshHost: required('SSH_HOST'),
    webroot: required('WEBROOT').replace(/\/+$/, ''),
    caddyfile: required('CADDYFILE'),
    webOwner: env.WEB_OWNER?.trim() || 'caddy:caddy',
    appSlug,
    urlPath,
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

/** Run a script on the server over ssh. `tty` allocates a PTY (needed for sudo prompts). */
function ssh(cfg: Config, script: string, tty = false): void {
  const flags = tty ? ['-t'] : [];
  run('ssh', [...flags, cfg.sshHost, script]);
}

// --- commands -----------------------------------------------------------------

function build(cfg: Config): string {
  const appDir = join(REPO_ROOT, 'apps', cfg.appSlug);
  if (!existsSync(appDir)) fail(`App not found: apps/${cfg.appSlug}`);

  log('Installing workspaces (npm ci)…');
  run('npm', ['ci']);

  const base = cfg.urlPath ? `/${cfg.urlPath}` : '/';
  log(`Building apps/${cfg.appSlug} (base=${base}) …`);
  // BASE_PATH makes Astro emit asset URLs under the sub-path so they match
  // Caddy's handle_path route instead of 404ing at the server root.
  run('npm', ['run', 'build', '-w', `apps/${cfg.appSlug}`], {
    env: { ...process.env, BASE_PATH: base },
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
  const remoteDir = `${cfg.webroot}/${cfg.appSlug}`;
  // rsync resolves "host:relpath" against the remote $HOME. Don't prefix $HOME —
  // the local shell would expand it to the local home.
  const stagingRel = `.churchix-deploy/${cfg.appSlug}`;

  log(`Uploading build to ${cfg.sshHost}:~/${stagingRel} …`);
  ssh(cfg, `mkdir -p ~/${stagingRel}`);
  run('rsync', ['-az', '--delete', '-e', 'ssh', `${distDir}/`, `${cfg.sshHost}:${stagingRel}/`]);

  log(`Publishing to ${remoteDir} (sudo on server)…`);
  ssh(
    cfg,
    [
      'set -e',
      `STAGING="$HOME/${stagingRel}"`,
      `sudo mkdir -p '${remoteDir}'`,
      `sudo rsync -a --delete "$STAGING/" '${remoteDir}/'`,
      `sudo chown -R ${cfg.webOwner} '${remoteDir}' 2>/dev/null || sudo chown -R root:root '${remoteDir}'`,
    ].join('\n'),
    true,
  );

  report(cfg, remoteDir);
}

function preDeploy(cfg: Config): void {
  const remoteDir = `${cfg.webroot}/${cfg.appSlug}`;
  const owner = cfg.webOwner.split(':')[0] ?? 'caddy';

  log(`Preparing server: webroot ${remoteDir} + Caddy route /${cfg.urlPath}/ …`);

  // Idempotent: create the webroot, and only insert a handle_path block for this
  // url-path if one is absent. Mirrors the Astro SSG try_files convention.
  const remoteScript = `
set -e
sudo mkdir -p '${remoteDir}'
sudo chown -R ${owner}:${owner} '${remoteDir}' 2>/dev/null || true

if sudo grep -q 'handle_path /${cfg.urlPath}/\\*' '${cfg.caddyfile}'; then
  echo 'Caddy route already present, leaving Caddyfile unchanged.'
else
  echo 'Inserting handle_path block before the final handle {} fallback.'
  BLOCK=$'\\t# --- ${cfg.appSlug} -> /${cfg.urlPath} ---\\n\\thandle_path /${cfg.urlPath}/* {\\n\\t\\troot * ${remoteDir}\\n\\t\\ttry_files {path} {path}/ {path}.html\\n\\t\\tfile_server\\n\\t}\\n'
  sudo cp '${cfg.caddyfile}' '${cfg.caddyfile}.bak'
  sudo awk -v block="$BLOCK" '
    !done && /^[[:space:]]*handle[[:space:]]*\\{/ { printf "%s\\n", block; done=1 }
    { print }
  ' '${cfg.caddyfile}.bak' | sudo tee '${cfg.caddyfile}' >/dev/null
fi

echo 'Validating Caddyfile…'
sudo caddy validate --config '${cfg.caddyfile}'
echo 'Reloading Caddy…'
sudo systemctl reload caddy
`;
  ssh(cfg, remoteScript, true);
  log('Server prepared. Run `npm run deploy` to publish the build.');
}

function report(cfg: Config, remoteDir: string): void {
  const ip = capture('ssh', ['-G', cfg.sshHost])
    .split('\n')
    .find((l) => l.startsWith('hostname '))
    ?.slice('hostname '.length)
    .trim();
  const host = ip || cfg.sshHost;
  const url = cfg.urlPath ? `http://${host}/${cfg.urlPath}/` : `http://${host}/`;
  log('Deployed.');
  console.log(`    apps/${cfg.appSlug}  →  ${url}`);
  console.log(c.dim(`    Published to ${cfg.sshHost}:${remoteDir}`));
}

// --- entry --------------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '-h' || command === '--help') {
  console.log(
    [
      'Usage: node --env-file=.env scripts/deploy.ts <command> [app-slug] [url-path]',
      '',
      'Commands:',
      '  pre-deploy   Prepare the server: webroot + Caddy route, validate, reload.',
      '  deploy       Build the app locally and upload dist/ to the server.',
      '',
      'app-slug / url-path override APP_SLUG / URL_PATH from .env for one-off runs.',
    ].join('\n'),
  );
  process.exit(command ? 0 : 1);
}

const cfg = loadConfig(rest);

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
