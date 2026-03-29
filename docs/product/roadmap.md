# MVP Roadmap — 1 Month Sprint

**Approach:** AI-first (Claude writes code, you review + integrate). 6 days/week.
**Goal:** Invite-only beta with core features live by Day 30.

---

## Week 1 — Foundation (Days 1–7)

### Day 1 — Monorepo Scaffold
- Init Turborepo root (`turbo.json`, root `package.json`, workspaces)
- Create all packages: `@truthlayer/database`, `@truthlayer/shared`, `@truthlayer/api-client`
- Git repo + `.gitignore` + `.env.example`
- Verify: `turbo dev` runs without errors

### Day 2 — Prisma Schema
- Write full Prisma schema covering both content tracks:
  - **Civic track:** `Report`, `Mission`, `MissionParticipant`
  - **Social track:** `Post`, `PostReaction`
  - **Shared:** `User`, `ReputationScore`, `WeeklyDelta`, `ReputationEvent`, `Image`
- All enums typed: `ContentType`, `MissionStage`, `Scope`, `ReachTier`, `ReputationDomain`, `ReactionType`
- PostGIS extension + `location geometry(Point, 4326)` on `User`, `Report`, `Mission`, `Post`
- Run first migration against Supabase PostgreSQL
- Verify: `prisma studio` shows all tables

### Day 3 — NestJS API Bootstrap
- NestJS + Fastify adapter setup (`main.ts`)
- `DatabaseModule` (Prisma singleton)
- `ConfigModule` with Zod env validation (`env.schema.ts`)
- Supabase Auth JWT guard (`common/guards/supabase-auth.guard.ts`)
- BullMQ + Upstash Redis connection
- Health check endpoint `GET /health`
- Verify: API starts, health check returns 200

### Day 4 — Auth + Users Modules
- `AuthModule`: phone/email login via Supabase Auth, JWT refresh
- `UsersModule`: get profile, update profile, domain reputation display
- DTOs + validation for both modules
- Verify: register → login → get profile flow works end-to-end

### Day 5 — Expo App Shell
- `create-expo-app` with Expo Router + TypeScript
- NativeWind (Tailwind) config
- Tab layout: Neighborhood · Missions · Report · Leaderboard · Profile
- Auth screens: login, phone verification, onboarding
- Connect `@truthlayer/api-client` to NestJS
- Verify: app runs on iOS simulator + Android emulator + web browser

### Day 6 — Shared Package + API Client
- `@truthlayer/shared`: Zod schemas for all entities, shared TypeScript types, constants (domains, reach tiers, XP values, queue names)
- `@truthlayer/api-client`: typed fetch functions + React Query hooks for auth and users
- Wire Expo app to use shared types (no manual type duplication)
- Verify: TypeScript compiles with zero errors across all packages

### Day 7 — Deploy Pipeline
- GitHub Actions: lint → type-check → build on every PR
- Fly.io: deploy NestJS API + set env vars
- Vercel: deploy Expo web + set env vars
- Expo EAS: configure build profiles (development, preview, production)
- Verify: push to main → auto-deploys to all three platforms

---

## Week 2 — Core Backend (Days 8–14)

### Day 8 — Reputation Service
- Move `reputation_engine.py` to `services/reputation/src/engine/`
- FastAPI wrapper: `POST /calculate`, `GET /score/{userId}/{domain}`, `GET /health`
- Deploy to Fly.io (separate app)
- Redis cache integration (score reads, 5-min TTL)
- Verify: call `/calculate` → score stored in Redis + PostgreSQL

### Day 9 — ReputationModule (NestJS)
- `ReputationModule`: read scores from Redis (cache-first), fallback to DB
- BullMQ job: `reputation-recalc.job.ts` → calls Python service
- BullMQ processor: `reputation-recalc.processor.ts`
- Reputation event emission on: credible, dispute, verified report
- Verify: trigger a reputation event → job queues → Python recalculates → Redis updated

### Day 10 — NeighborhoodsModule
- PostGIS geospatial queries: assign user to neighborhood (2km radius)
- `NeighborhoodsModule`: get neighborhood, list nearby users, get neighborhood stats
- Cache neighborhood membership in Redis (invalidate on location update)
- Supabase Realtime: neighborhood feed channel setup
- Verify: GPS coordinates → correct neighborhood returned

### Day 11 — ReportsModule
- `ReportsModule`: create report, list reports by neighborhood, confirm report
- GPS validation (must be within 200m of report pin)
- Signed Cloudflare R2 upload URL generation
- Report status transitions: `PENDING` → `ACTIVE` (at 3+ confirmations)
- BullMQ job: trigger image verification on upload
- Verify: create report → upload photo to R2 → report appears in neighborhood

### Day 12 — MissionsModule + PostsModule
- `MissionsModule`: create mission, get mission, update lifecycle stage
- Scope logic: Street → Neighborhood → City (auto-escalation rules)
- Mission participants: join, assign role, track contribution
- `PostsModule`: create post (fact_claim/opinion/question/satire/personal_experience), list posts by neighborhood, apply slow-mode (`isSlowed`, `slowReason`) — never delete
- `PostReaction` handling: credible/dispute/trust reactions, enforce one-per-user, enqueue `post-reactions` BullMQ job
- Verify: create mission → stage transitions work; create post → appears in feed; react → `PostReaction` row created

### Day 13 — SearchModule
- Typesense Cloud setup: indexes for `users`, `missions`, `posts`, `neighborhoods`
- `SearchModule`: full-text search across all four indexes
- Sync Prisma writes to Typesense via BullMQ `search-index` jobs (missions + posts)
- Verify: create mission and post → both appear in Typesense search results within seconds

### Day 14 — NotificationsModule
- `NotificationsModule`: Expo Push Notifications via `expo-server-sdk`
- Notification types: mission update, reputation change, confirmation needed, streak reminder
- BullMQ processor: `notification.processor.ts`
- Respect quiet hours (10PM–7AM local time)
- Verify: trigger event → push notification delivered to device

---

## Week 3 — Core App Screens (Days 15–21)

### Day 15 — Neighborhood Feed Screen
- Real-time feed via Supabase Realtime (live updates, no polling)
- Feed items: **both tracks** — posts (social) + reports/missions (civic) + verifications + reputation events
- Feed items show content type badge (`fact_claim`, `opinion`, `question`, etc.)
- Slow-mode posts display a context label instead of being hidden
- Infinite scroll with React Query
- Verify: two devices → action on one → instantly appears on other

### Day 16 — Camera-First Reporting Screen
- `expo-camera` integration (no gallery access for reports)
- Live GPS capture + timestamp overlay on preview
- Photo upload to R2 via signed URL
- Category picker + pin drop on map (`react-native-maps`)
- Submit → optimistic UI update
- Verify: full report flow on physical device with real GPS

### Day 17 — Mission Screen
- Mission detail: lifecycle stage display, scope badge, participant list
- Stage progression UI (Identify → Research → Propose → Act → Measure)
- Join mission CTA + role selection
- Before/after photo comparison for resolution
- Verify: full mission lifecycle navigable in app

### Day 18 — Community Confirmation Flow
- Confirmation screen: view existing photos, submit your own
- Progress indicator: "2 of 3 confirmations needed"
- Camera-first (same rules as reporting — no gallery)
- Auto-transition to Active state at 3 confirmations
- Verify: 3 users confirm → report status → Active in real-time

### Day 19 — Swipe Interactions (Post Reactions)
- Swipe gestures on `Post` cards: swipe right = Credible, swipe left = Dispute, long press = Trust
- Creates/updates a `PostReaction` row (one per user per post, `@@unique([postId, userId])`)
- Dispute modal: reason picker (inaccurate, misleading context, missing source, outdated)
- Trust modal: domain selector (science, health, politics, etc.)
- Animate swipe with `react-native-reanimated`
- BullMQ job: enqueue reputation event on each reaction via `post-reactions` queue
- Only `FACT_CLAIM` posts are eligible for Credible/Dispute rep effects
- Verify: swipe → `PostReaction` created → reputation event queued → score updates within 10s

### Day 20 — Social Post Creation Screen
- Post creation screen: user writes body text, selects `ContentType` (fact_claim, opinion, satire, question, personal_experience)
- Optional domain tag (`ReputationDomain`) for fact claims
- Optional location tag (GPS for local-feed placement)
- Optional photo attach (gallery allowed for posts — camera-first rule applies to reports only)
- AI classification suggestion (call `/classify` on reputation service); user can override
- Display classification badge on feed items
- Misclassification penalty (AI-confirmed): -1.5 rep via BullMQ
- Verify: create fact_claim post → badge displays → wrong classification → -1.5 rep queued

### Day 21 — Profile Screen
- Level + title display (Observer → Catalyst)
- Badge showcase with unlock dates
- Reputation bars per domain (10 domains)
- Active neighborhoods list
- Missions contributed to
- Verify: profile reflects all earned XP, badges, reputation correctly

---

## Week 4 — Gamification + Verification + Beta (Days 22–30)

### Day 22 — XP System
- XP earning on every action (BullMQ job per action type)
- Daily cap enforcement (200 XP/day, tracked in Redis)
- XP history in PostgreSQL (`ReputationEvent` table, append-only)
- Verify: perform 10 actions → XP accumulates → cap enforced at 200

### Day 23 — Levels + Streaks
- Level thresholds and unlock logic
- Level-up animation trigger (send event to Expo app via Supabase Realtime)
- Daily streak tracking (Redis counter, reset at midnight local time)
- 2 free streak freezes/month
- Streak bonus XP (additive by day range)
- Verify: complete daily action → streak increments → freeze consumed correctly

### Day 24 — Badges
- Badge award logic (BullMQ processor checks conditions after each action)
- 8 badge types: First Responder, Fixer, Truth Seeker, Neighborhood Hero, Bridge Builder, Streak Master, City Catalyst, Global Solver
- Badge unlock notification + envelope animation in app
- Verify: complete badge condition → badge awarded → notification delivered

### Day 25 — Daily Quests
- Quest generation: 4 tasks/day, contextual to neighborhood activity
- Quest reset at midnight local time (BullMQ cron job)
- Bonus XP on completing all 4
- Verify: quests generate daily → completing all 4 → bonus XP awarded

### Day 26 — Leaderboard
- Neighborhood leaderboard (weekly reset via BullMQ cron)
- Ranked by verified impact (not raw XP)
- "X XP to next rank" display
- City leaderboard (Level 8+ only)
- Verify: leaderboard updates in real-time, weekly reset works

### Day 27 — Image Verification Pipeline
- BullMQ processor: `image-verification.processor.ts`
- Layer 1: GPS + timestamp validation (sync, in ReportsModule)
- Layer 2: AI-gen detection via Hive Moderation API (async job)
- Layer 3: community cross-verification (reputation-weighted, existing confirmation flow)
- Fake report consequences: -15 rep job, pre-approval flag on user
- Verify: submit known fake image → verification fails → rep penalty queued

### Day 28 — Anti-Gaming + Security Hardening
- Coordinated attack detection: 20+ reports in 1 hour from similar accounts → freeze
- Reporter reputation gating: reports from rep <25 silently ignored
- Rate limiting on all endpoints (Cloudflare WAF rules)
- Probation sandbox: new accounts in sandboxed reach tier for 2 weeks
- Verify: simulate coordinated attack → accounts frozen, reports ignored

### Day 29 — Monitoring + Performance
- Sentry: error tracking in Expo app + NestJS + Python service
- Axiom: structured logging across all services
- Expo web: Core Web Vitals check via Vercel Analytics
- Redis cache hit rate check (target >90% for reputation reads)
- Prisma query performance: add missing indexes
- Verify: intentional error → appears in Sentry within 30s

### Day 30 — Beta Launch
- Invite system: generate 500 invite codes (one-time use, stored in PostgreSQL)
- Seed data: 5 demo neighborhoods with existing missions and reports
- Smoke test: full user journeys on production:
  - Civic: register → report → confirm → mission created → earn XP → level up
  - Social: post fact_claim → receive credible reaction → rep score updates
- "You're caught up" endpoint (empty state handling)
- EAS production build submitted to App Store + Play Store review
- Flip Vercel deployment to production domain

---

## What's Post-Beta (v1.1)

These are intentionally cut from the 30-day sprint:

- B2B REST API (`B2bModule`) — Month 2
- Scope escalation beyond Neighborhood → City — Month 2
- Premium subscription billing — Month 2
- Resolution re-verification (7-day check) — Month 2
- Neo4j graph DB migration — Month 3+
- Elasticsearch upgrade from Typesense — Month 4+

---

## Daily Time Allocation (suggested)

| Time | Activity |
|------|----------|
| 9AM–12PM | Build with Claude (new features) |
| 12PM–1PM | Break |
| 1PM–4PM | Integrate, test, debug |
| 4PM–5PM | Review Claude output, refactor |
| 5PM–6PM | Plan next day's tasks |

**One feature per day.** If a day's task isn't done by end of day, carry it forward and cut post-beta scope — never cut core features.
