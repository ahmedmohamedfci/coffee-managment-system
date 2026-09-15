# SaaSFood

Multi-tenant coffee-shop POS demo (Next.js + mocked APIs).  
Languages: English, Czech, Arabic (RTL).

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

### Owner walkthrough

1. **Waiter** (104 / 2222) → floor → table → add items → **Submit to kitchen**
2. Open **Kitchen Display System** — tickets update on submit (a sample ticket is seeded)
3. Toggle **EN | CS | AR** in the demo HUD

## Packages

| Path | Role |
|---|---|
| `apps/web` | Next.js App Router demo |
| `packages/ui` | Exportable presentational components |
| `packages/shared` | Types, i18n, MockApi |
| `design-preview` | Static HTML visual reference |

## Production (Namecheap VPS + subdomain)

Requires Docker on the VPS and a DNS **A record** for your subdomain pointing at the VPS IP.

### 1. DNS (Namecheap)

- Host: `demo` (or your subdomain label)
- Type: `A`
- Value: your VPS public IP

### 2. On the VPS

```bash
git clone https://github.com/ahmedmohamedfci/coffee-managment-system.git
cd coffee-managment-system
cp .env.example .env
# edit NEXT_PUBLIC_APP_URL=https://demo.yourdomain.com

docker compose up -d --build
```

App listens on `0.0.0.0:3000` inside the container (mapped with `HOST_PORT`).

### 3. Nginx reverse proxy

```bash
sudo cp deploy/nginx-subdomain.conf.example /etc/nginx/sites-available/saasfood
# edit server_name
sudo ln -sf /etc/nginx/sites-available/saasfood /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. TLS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d demo.yourdomain.com
```

### Useful commands

```bash
docker compose logs -f web
docker compose pull && docker compose up -d --build
pnpm build && pnpm --filter @saasfood/web start   # without Docker
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `docker compose up -d --build` | Build & run container |
