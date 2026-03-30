# TruthLayer — Deployment Setup Guide

This guide covers everything needed to deploy TruthLayer from scratch:
- **NestJS API** → Fly.io
- **Expo web** → Vercel
- **iOS / Android** → Expo EAS (manual)

All commands are run from the **monorepo root** unless stated otherwise.

---

## Prerequisites

- Node.js 20 LTS + npm 10
- [flyctl](https://fly.io/docs/hands-on/install-flyctl/) — `brew install flyctl`
- [Vercel CLI](https://vercel.com/docs/cli) — `npm i -g vercel`
- [EAS CLI](https://docs.expo.dev/eas/) — `npm i -g eas-cli` (mobile only)
- Accounts: Supabase · Upstash · Cloudflare · Typesense Cloud · Fly.io · Vercel · GitHub

---

## Step 1 — Supabase (PostgreSQL + Auth)

1. Go to [supabase.com](https://supabase.com) → **New project**
   - Region: **US East (N. Virginia)** — closest to Fly.io `iad`
   - Save the database password securely

2. In **SQL Editor**, enable PostGIS (required by the schema):
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. Collect from **Settings → API**:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_KEY` — service_role secret key

4. Collect from **Settings → Database → Connection string → URI**:
   - `DATABASE_URL` — looks like `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

5. Create the initial migration **locally** (only done once):
   ```sh
   # Fill in DATABASE_URL in your local .env first
   npx prisma migrate dev --name init --schema=packages/database/prisma/schema.prisma
   ```
   This creates `packages/database/prisma/migrations/` — **commit this folder**.

---

## Step 2 — Upstash Redis (two databases)

Go to [upstash.com](https://upstash.com) → **Create database** (region: US-East-1)

**Database 1 — Cache** (used by `@upstash/redis` REST client)
- Name: `truthlayer-cache`
- After creation → **REST API** tab:
  - `UPSTASH_REDIS_URL` — the `UPSTASH_REDIS_REST_URL` value (`https://...`)
  - `UPSTASH_REDIS_TOKEN` — the `UPSTASH_REDIS_REST_TOKEN` value

**Database 2 — Queues** (used by BullMQ via ioredis)
- Name: `truthlayer-queues`
- After creation → **Details** tab:
  - `REDIS_URL` — the `rediss://` connection string (note the double `s` — TLS required)

---

## Step 3 — Cloudflare R2

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage → Create bucket**
   - Name: `truthlayer`
   - Set `CLOUDFLARE_R2_BUCKET=truthlayer`

2. Your **Account ID** is in the right sidebar of the R2 page → `CLOUDFLARE_R2_ACCOUNT_ID`

3. **R2 → Manage R2 API Tokens → Create API token**
   - Permissions: Object Read & Write
   - Scope: specific bucket → `truthlayer`
   - Copy `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`

---

## Step 4 — Typesense Cloud

1. Go to [cloud.typesense.org](https://cloud.typesense.org) → **Launch new cluster**
   - Region: US East, RAM: 0.5 GB (smallest)

2. After cluster is running → **Keys** tab:
   - `TYPESENSE_HOST` — cluster hostname, e.g. `abc123.a1.typesense.net`
   - `TYPESENSE_API_KEY` — admin API key

---

## Step 5 — Fly.io (NestJS API)

**5a. Authenticate**
```sh
fly auth login
```

**5b. Create the app** (reserves the name, no deploy yet)
```sh
fly apps create truthlayer-api
```

**5c. Set all runtime secrets** (replace placeholders with real values)
```sh
fly secrets set \
  DATABASE_URL="postgresql://postgres:YOUR_PW@db.YOUR_REF.supabase.co:5432/postgres" \
  SUPABASE_URL="https://YOUR_REF.supabase.co" \
  SUPABASE_ANON_KEY="eyJ..." \
  SUPABASE_SERVICE_KEY="eyJ..." \
  UPSTASH_REDIS_URL="https://YOUR_ENDPOINT.upstash.io" \
  UPSTASH_REDIS_TOKEN="YOUR_TOKEN" \
  REDIS_URL="rediss://default:YOUR_TOKEN@YOUR_ENDPOINT.upstash.io:6380" \
  CLOUDFLARE_R2_BUCKET="truthlayer" \
  CLOUDFLARE_R2_ACCOUNT_ID="YOUR_ACCOUNT_ID" \
  R2_ACCESS_KEY_ID="YOUR_KEY_ID" \
  R2_SECRET_ACCESS_KEY="YOUR_SECRET" \
  TYPESENSE_HOST="YOUR_CLUSTER.typesense.net" \
  TYPESENSE_API_KEY="YOUR_KEY" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  REPUTATION_SERVICE_URL="http://localhost:8000" \
  -a truthlayer-api
```

> Secrets are encrypted and injected at runtime. Never put them in `fly.toml` or commit them to git.

**5d. Generate a deploy token for GitHub Actions**
```sh
fly tokens create deploy -x 999999h -a truthlayer-api
# Save the output as GitHub secret: FLY_API_TOKEN
```

**5e. Verify secrets are set**
```sh
fly secrets list -a truthlayer-api
```
All variables from `services/api/src/config/env.schema.ts` must appear in the list.

---

## Step 6 — Vercel (Expo web)

**6a. Link the project** (run from monorepo root)
```sh
vercel login
vercel link
# Answer: create a new project, accept all defaults
```
This creates `.vercel/project.json`. Open it and note:
- `VERCEL_ORG_ID` — the `orgId` value
- `VERCEL_PROJECT_ID` — the `projectId` value

**6b. Generate a Vercel token**
- Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create token**
- Name: `github-actions`, no expiry
- Save as `VERCEL_TOKEN`

**6c. Set environment variables in the Vercel dashboard**

Project → **Settings → Environment Variables** → add for all environments:

| Variable | Value |
|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | same as `SUPABASE_URL` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | same as `SUPABASE_ANON_KEY` |
| `EXPO_PUBLIC_API_URL` | `https://truthlayer-api.fly.dev` |

---

## Step 7 — GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Source |
|--------|--------|
| `FLY_API_TOKEN` | Step 5d |
| `VERCEL_TOKEN` | Step 6b |
| `VERCEL_ORG_ID` | Step 6a — `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Step 6a — `.vercel/project.json` |

---

## Step 8 — First Deploy

```sh
git add .
git commit -m "feat: initial deploy setup"
git push origin main
```

GitHub Actions triggers two parallel jobs:
- **deploy-api** — builds Docker image on Fly's remote builders, runs `prisma migrate deploy` as a release command (rolls back if migration fails), then starts the API
- **deploy-web** — Vercel builds the Expo web SPA and deploys

Monitor at: `https://github.com/YOUR_ORG/YOUR_REPO/actions`

---

## Step 9 — Wire CORS

Once Vercel gives you a URL (e.g. `https://truthlayer.vercel.app`), add it to Fly:
```sh
fly secrets set CORS_ORIGIN="https://truthlayer.vercel.app" -a truthlayer-api
```
This triggers a redeployment automatically.

---

## Smoke Tests

```sh
# API health check
curl https://truthlayer-api.fly.dev/health
# expected: {"status":"ok"}

# Tail live logs
fly logs -a truthlayer-api
```

Visit the Vercel URL in a browser — auth screen should load, and DevTools → Network should show API calls going to `truthlayer-api.fly.dev` without CORS errors.

---

## Mobile Builds (EAS)

EAS builds are **not** triggered automatically by CI — run manually when ready for TestFlight or Play Store:

```sh
# Log in to Expo account
eas login

# Build for a specific platform and profile
eas build -p ios --profile production
eas build -p android --profile production

# Submit to app stores (after build completes)
eas submit -p ios --latest
eas submit -p android --latest
```

Build profiles are defined in [apps/app/eas.json](apps/app/eas.json):
- `development` — dev client, internal distribution
- `preview` — internal distribution (no dev client)
- `production` — auto-increment build number, store submission

---

## Subsequent Deploys

Every push to `main` automatically:
1. Runs CI (lint → type-check → build) via `.github/workflows/ci.yml`
2. Deploys API to Fly and web to Vercel via `.github/workflows/deploy.yml`

Prisma migrations are applied automatically on each API deploy via the Fly `release_command` in `services/api/fly.toml`. To add a new migration:
```sh
npx prisma migrate dev --name your_migration_name --schema=packages/database/prisma/schema.prisma
git add packages/database/prisma/migrations/
git commit -m "db: add your_migration_name migration"
git push origin main
```

---

## Known Gotchas

| Issue | Fix |
|-------|-----|
| `flyctl deploy` must be run from **monorepo root** | Use `--config services/api/fly.toml` flag — never cd into `services/api/` first |
| Prisma engine binary mismatch on Alpine | `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` is set in `schema.prisma` |
| Prisma needs OpenSSL at runtime | `RUN apk add --no-cache openssl` is in the Dockerfile runner stage |
| `turbo prune` omits root `tsconfig.json` from `out/full/` | Dockerfile copies it explicitly: `COPY --from=pruner /app/tsconfig.json ./tsconfig.json` |
| Expo web env vars embedded at build time | Must be set in Vercel dashboard **before** first deploy — empty strings get baked into the SPA bundle |
