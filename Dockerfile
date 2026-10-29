# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
RUN pnpm --filter @saasfood/web build

# Keep monorepo + DB_UPDATES so entrypoint can run filename-ledger migrate on boot.
FROM build AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN mkdir -p /app/standalone \
  && cp -a /app/apps/web/.next/standalone/. /app/standalone/ \
  && mkdir -p /app/standalone/apps/web/.next \
  && cp -a /app/apps/web/.next/static /app/standalone/apps/web/.next/static \
  && if [ -d /app/apps/web/public ]; then cp -a /app/apps/web/public /app/standalone/apps/web/public; fi

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
