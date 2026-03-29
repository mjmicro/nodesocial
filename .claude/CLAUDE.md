# TruthLayer — Claude Code Instructions

## What is TruthLayer?

Civic social platform replacing the attention economy with an impact economy. Users report local problems, verify outcomes with photos, earn XP/reputation for real-world contribution. Fights misinformation through structure, not moderation.

**Core rules:** No ads ever · Camera-first verification (no gallery for reports) · Local-first (2km neighborhoods) · Context over censorship (tag + slow, never remove) · Fun via gamification

---

## Tech Stack

| Layer | Technology |
|---|---|
| App (web + iOS + Android) | Expo Universal, Expo Router, NativeWind, TypeScript |
| Backend API | NestJS + Fastify adapter, Node.js, TypeScript |
| ORM | Prisma — schema is single source of truth |
| Database | PostgreSQL 16 via Supabase |
| Auth | Supabase Auth (JWT, phone + email) |
| Realtime | Supabase Realtime |
| Cache + Queue | Upstash Redis + BullMQ |
| Search | Typesense (→ Elasticsearch later) |
| Storage | Cloudflare R2 |
| CDN + DDoS | Cloudflare |
| Reputation service | Python FastAPI (`services/reputation/`) |
| Monorepo | Turborepo |
| Hosting | Vercel (web) · Expo EAS (mobile) · Fly.io (API + Python) |

---

## Monorepo Structure

```
truthlayer/
├── apps/app/                        ← Expo Universal (web + iOS + Android)
├── packages/
│   ├── database/prisma/schema.prisma ← SOURCE OF TRUTH for all data types
│   ├── shared/                       ← Zod schemas, TS types, constants
│   └── api-client/                   ← Typed API client for Expo
└── services/
    ├── api/                          ← NestJS + Fastify
    └── reputation/                   ← Python FastAPI
```

**Workspace aliases:** `@truthlayer/database` · `@truthlayer/shared` · `@truthlayer/api-client`

---

## Architecture Rules

### 1. Prisma = single source of truth
Never manually define a type that mirrors a Prisma model — import it from `@truthlayer/database`. After any schema change run `prisma generate` before touching other files.

### 2. NestJS module pattern — every feature follows this exactly
```
services/api/src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts   ← HTTP handlers only, zero business logic
├── <feature>.service.ts      ← all business logic lives here
├── dto/
└── entities/
```

### 3. Shared types go in `@truthlayer/shared`
Zod schemas → `packages/shared/src/validators/`
TypeScript types → `packages/shared/src/types/`
Constants (domains, reach tiers, XP values, queue names) → `packages/shared/src/constants/`

### 4. BullMQ pattern
```
services/api/src/queue/
├── jobs/<feature>.job.ts          ← payload type + queue name constant
└── processors/<feature>.processor.ts  ← @Processor decorator
```
Services enqueue. Processors handle. Never do heavy work synchronously in a request.

### 5. Expo app structure
```
apps/app/src/
├── app/          ← Expo Router file-based routes
├── components/   ← NativeWind styled UI
├── hooks/        ← React Query hooks
└── store/        ← Zustand global state
```
NativeWind (Tailwind) for all styling. Never use `StyleSheet.create`.

### 6. Supabase Auth in NestJS
Verify JWT in `common/guards/supabase-auth.guard.ts`. Always extract userId from verified JWT — never trust client-provided IDs.

---

## NestJS Modules

| Module | Responsibility |
|--------|---------------|
| `auth` | JWT verification, session management |
| `users` | Profiles, domain reputation display |
| `missions` | Lifecycle, scope escalation |
| `neighborhoods` | Location-based grouping, 2km radius |
| `reports` | Issue reporting, camera + GPS validation |
| `reputation` | Score reads (Redis cache-first), event emission |
| `search` | Typesense integration |
| `notifications` | BullMQ-backed push + in-app alerts |
| `b2b` | REST API for newsrooms/researchers |

---

## Key Conventions

**TypeScript:** Strict mode always · No `any` — use `unknown` and narrow · Zod for all runtime validation · Infer types from Zod: `type X = z.infer<typeof XSchema>`

**Prisma:** Use `select` to limit returned fields · Transactions for operations touching >1 table · No raw SQL unless Prisma can't express the query

**BullMQ:** Jobs must be idempotent (may retry) · `attempts: 3`, `backoff: { type: 'exponential' }` on all jobs · Queue names are constants in `@truthlayer/shared`

**Cloudflare R2:** Generate signed upload URLs — client uploads direct to R2, then sends key to API. Never stream files through the API server.

---

## Environment Variables

Validated with Zod in `services/api/src/config/env.schema.ts`.

```
DATABASE_URL
SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SERVICE_KEY
UPSTASH_REDIS_URL · UPSTASH_REDIS_TOKEN
CLOUDFLARE_R2_BUCKET · CLOUDFLARE_R2_ACCOUNT_ID · R2_ACCESS_KEY_ID · R2_SECRET_ACCESS_KEY
TYPESENSE_HOST · TYPESENSE_API_KEY
JWT_SECRET
REPUTATION_SERVICE_URL
```

---

## Key Files & Docs

| File | Purpose |
|------|---------|
| `packages/database/prisma/schema.prisma` | DB schema — source of truth |
| `services/reputation/src/engine/reputation_engine.py` | Scoring algorithm (757 lines) |
| `docs/architecture/reputation-engine.md` | Formula, weights, NestJS integration |
| `docs/architecture/verification-pipeline.md` | 6-layer anti-fraud pipeline |
| `docs/product/gamification.md` | XP, levels, badges, streaks, quests |
| `docs/product/scope-system.md` | Neighborhood model, scope escalation |
| `docs/product/engagement-model.md` | Credible/Dispute/Trust, content types, UX |
| `docs/product/roadmap.md` | MVP build order (months 1–6) |

---

## Never Do

- Define types that duplicate Prisma models
- Put business logic in NestJS controllers
- Call the reputation service synchronously from a request — use BullMQ
- Use `any` in TypeScript
- Upload files through the API — use signed R2 URLs
- Hardcode queue names, domain names, XP values, or reach tier thresholds
- Bypass the Supabase JWT guard on authenticated routes
- Delete or update `ReputationEvent` rows — append-only
