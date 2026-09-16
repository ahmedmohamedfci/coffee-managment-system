# SaaSFood

pnpm monorepo — Next.js FE demo with mocked APIs.

## Local run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Packages

- `apps/web` — Next.js App Router demo
- `packages/ui` — exportable presentational components
- `packages/shared` — types, i18n (en/cs/ar), MockApi
- `design-preview` — static HTML visual reference

## Owner walkthrough

1. Waiter (104 / 2222) → floor → table → add items → **Submit to kitchen**
2. Open **Kitchen Display System** — tickets appear on submit (3 sample tickets ship by default)
3. EN | CS | AR language toggle in the demo HUD

---

## Deploy to a VPS

### Recommended: GitHub Actions builds the dist, you run it on the VPS

**Do not** build on the VPS with `npm run` from a public clone unless you have to. Prefer:

1. **CI builds** a portable standalone bundle (this repo’s workflow).
2. You **copy that artifact** to the VPS over SSH.
3. VPS only needs **Node.js 20+** to run `node apps/web/server.js`.

### What the workflow does

Workflow: [`.github/workflows/build-vps-dist.yml`](.github/workflows/build-vps-dist.yml)

- Runs on push to `main`/`master` (or manually via **Actions → Build VPS dist → Run workflow**).
- Produces artifact **`saasfood-dist`** (`saasfood-dist.tgz`).
- Inside: Next.js **standalone** server + static assets.

### Deploy steps (manual, secure)

On your laptop:

```bash
# Download the artifact from the GitHub Actions run UI, then:
scp saasfood-dist.tgz user@YOUR_VPS:/opt/saasfood/
ssh user@YOUR_VPS
```

On the VPS:

```bash
cd /opt/saasfood
tar -xzf saasfood-dist.tgz
# keep NODE on localhost; put a reverse proxy in front
PORT=3000 HOSTNAME=127.0.0.1 node apps/web/server.js
```

Use **systemd** or **pm2** to keep it alive, and **Caddy/nginx** for HTTPS on `:443` → `127.0.0.1:3000`.

Optional later: add a second workflow job that `scp`/`rsync`s using GitHub **Secrets** (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`). Never commit those secrets.

### Can I just SSH and `pnpm build && pnpm start`?

Yes, it works, but for a **public** repo it’s worse:

- You pull all source onto the VPS.
- Builds consume CPU/RAM on the VPS.
- Easy to accidentally leave `.env` or keys on the box.

CI → artifact → run is cleaner.

---

## Keeping a public GitHub repo + VPS secure

The app is a **demo with mocked data** today (no real customer DB). Still treat the VPS as hostile-internet:

1. **Never commit secrets** — no SSH keys, `.env`, DB URLs, API tokens in the repo. Use GitHub Actions secrets / VPS env files with `chmod 600`.
2. **Deploy key scoped only to deploy** — a dedicated SSH key in GitHub Secrets that can only write files to `/opt/saasfood`, not your whole server.
3. **Firewall** — allow `22` (or a non-default SSH port) from your IP if possible; allow `80/443` publicly; **do not** open Node’s `3000` to the world.
4. **Reverse proxy + TLS** — Caddy or nginx terminates HTTPS; app binds `127.0.0.1`.
5. **Non-root user** — run the Node process as `saasfood` (or similar), not `root`.
6. **SSH hardening** — key auth only, `PermitRootLogin no`, fail2ban or equivalent.
7. **Updates** — keep Node/OS patched; rotate deploy keys if leaked.
8. **When you add a real backend** — put auth, rate limits, and tenant isolation on the API; never rely on “security through obscurity” of a public demo URL.

Public source code is fine. **Public credentials and open admin ports are not.**
