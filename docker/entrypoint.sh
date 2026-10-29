#!/bin/sh
set -eu

cd /app

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[saasfood] ERROR: DATABASE_URL is required to apply DB_UPDATES."
  exit 1
fi

echo "[saasfood] Applying pending DB_UPDATES…"
pnpm --filter @saasfood/db migrate

echo "[saasfood] Starting Next.js server…"
cd /app/standalone
exec node apps/web/server.js
