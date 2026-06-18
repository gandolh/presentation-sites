# Deploy

Zero-dependency Node + TypeScript deploy tool for the **showcase** static site.
No npm install needed — it runs on Node's built-in TypeScript stripping
(Node ≥ 22.6) and shells out to `ssh` / `scp` / `rsync`, which you already have.

The site is served under the sub-path `/showcase` on the shared VPS that also
hosts `saloon` (/saloon), `auto-service` (/auto-service), `subcort` (/subcort)
and `tractari` (/tractari) — see `Caddyfile.example` (add the showcase block to
the same `:80` server block as the others, don't create a second one).

> showcase is a **portfolio gallery** of the other sites. The build is fully
> self-contained (screenshots live in `public/shots/`), so `deploy` just builds
> with the sub-path base and uploads `dist/`.

## Live-site links

The gallery tiles link to the sibling sites on the same VPS. Set
`PUBLIC_SITES_HOST` in `deploy/.env` to that VPS origin (e.g.
`http://203.0.113.5`) and the deploy bakes absolute links into the build. Leave
it unset and the tiles fall back to same-origin relative links (`/saloon`, …),
which resolve correctly when the gallery is viewed on the VPS itself.

## One-time setup

```bash
cp deploy/.env.example deploy/.env             # then edit deploy/.env
cp deploy/Caddyfile.example deploy/Caddyfile   # then edit deploy/Caddyfile
```

`deploy/.env` is git-ignored (it points at your server). `deploy/.env.example`
is the tracked template. SSH auth uses your key / `~/.ssh/config` — no passwords
or secrets live in the repo.

## Phases

| Phase        | What it does                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------- |
| `pre-deploy` | Provision the server: check SSH, ensure **Caddy** is installed, ensure `REMOTE_DIR` exists with the right owner, upload + validate the `Caddyfile`, reload Caddy. Run when the server is new or the Caddyfile changed. |
| `deploy`     | Build the site **locally** with the sub-path base (and `PUBLIC_SITES_HOST`) baked in, then `rsync` `dist/` to the server as an exact mirror. Run on every release. |

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
needed) install Caddy or create `/var/www/showcase`.

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
