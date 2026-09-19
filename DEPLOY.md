# Deploy (Coolify)

SaaSFood already has a production `Dockerfile` (Next.js standalone on port 3000). Keep using that on Coolify; Render/`render.yaml` and the VPS artifact workflow are unchanged.

## Coolify

1. Create an application from this GitHub repo, branch **main**.
2. Build pack: **Dockerfile**.
3. Set env vars as needed (`DATABASE_URL`, etc.) and a domain (e.g. `food.zildra.com`); enable HTTPS.
4. Copy **Deploy Webhook (auth required)** from Configuration → Webhooks.
5. Create an API token with **deploy** permission.
6. GitHub secrets (Actions):
   - `COOLIFY_WEBHOOK_URL`
   - `COOLIFY_TOKEN`
7. Push to `main` to trigger `.github/workflows/coolify-deploy.yml`.

Do not commit secrets. The existing `build-vps-dist.yml` workflow still builds a VPS artifact separately.
