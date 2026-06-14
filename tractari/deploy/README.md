# Deploy

Zero-dependency Node + TypeScript deploy tool for the AXA Tractări static site.
No npm install needed — it runs on Node's built-in TypeScript stripping
(Node ≥ 22.6) and shells out to `ssh` / `scp` / `rsync`, which you already have.

The site is served under the sub-path `/tractari` on the shared VPS that also
hosts `saloon` (/saloon), `auto-service` (/auto-service) and `subcort` (/subcort)
— see `Caddyfile.example` (add the AXA Tractări block to the same `:80` server
block as the others, don't create a second one).

> AXA Tractări is a **demo / concept** site. The build is fully self-contained
> (the hero is a Three.js scene built from primitives — no external assets to
> source), so `deploy` just builds with the sub-path base and uploads `dist/`.

## One-time setup

```bash
cp deploy/.env.example deploy/.env             # then edit deploy/.env
cp deploy/Caddyfile.example deploy/Caddyfile   # then edit deploy/Caddyfile
```

`deploy/.env` is git-ignored (it points at your server). `deploy/.env.example`
is the tracked template. SSH auth uses your key / `~/.ssh/config` — no passwords
or secrets live in the repo.

## Phases

The tool has two phases:

| Phase        | What it does                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------- |
| `pre-deploy` | Provision the server: check SSH, ensure **Caddy** is installed, ensure `REMOTE_DIR` exists with the right owner, upload + validate the `Caddyfile`, reload Caddy. Run when the server is new or the Caddyfile changed. |
| `deploy`     | Build the site **locally** with the sub-path base baked in, then `rsync` `dist/` to the server as an exact mirror. Run on every release. |

> This site is a **static** build served by Caddy — there is no Node process on
> the server, so pre-deploy provisions Caddy, not pm2.

## Usage

```bash
# Provision the server (first deploy, or after editing deploy/Caddyfile)
npm run deploy:pre        # → node deploy/deploy.ts pre-deploy

# Build + upload (the everyday command)
npm run deploy:push       # → node deploy/deploy.ts deploy

# Both, in order
npm run deploy:all        # → node deploy/deploy.ts all
```

Direct invocation with flags:

```bash
node deploy/deploy.ts deploy --no-build     # upload existing dist/ as-is
node deploy/deploy.ts pre-deploy --dry-run  # print actions, touch nothing
node deploy/deploy.ts --help
```

## sudo on the server

`pre-deploy` needs root to write `/etc/caddy/Caddyfile`, reload Caddy, and (if
needed) install Caddy or create `/var/www/tractari`.

- `SUDO_NOPASSWD=true` — the tool runs the `sudo` commands over SSH directly.
- `SUDO_NOPASSWD=false` (default) — it **prints the exact command** for you to
  run on the server, then waits for confirmation. This avoids hanging on a
  password prompt over a non-interactive SSH channel.

## Files

- `deploy.ts` — the tool (tracked).
- `.env.example` — config template (tracked).
- `.env` — your real config (git-ignored).
- `Caddyfile.example` — Caddy config template (tracked).
- `Caddyfile` — server web-server config, uploaded by `pre-deploy` (git-ignored,
  server-specific).
