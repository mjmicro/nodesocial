# TruthLayer — Project Brief for Claude Code

## What is TruthLayer?

TruthLayer is a civic social networking platform that replaces the attention economy with an impact economy. Users report local problems, collaborate to solve them, verify outcomes with photos, and earn XP/reputation for real-world contribution. It fights misinformation through structural design — not moderation.

## Core Philosophy

- **No ads, ever.** Revenue comes from subscriptions, B2B API, and institutional licenses.
- **Local-first.** The default screen is "Neighborhoods" (2km radius). 50 users in one colony > 50,000 scattered globally.
- **Fun, not preachy.** Gamification (XP, levels, daily quests, badges, streaks, leaderboards) makes civic action feel like a multiplayer game.
- **Context, not censorship.** Unverified content is tagged and slowed, never removed.
- **Camera-first verification.** Issue reports and resolution claims require in-app camera capture (no gallery uploads) with live GPS, device attestation, and timestamp.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo, TypeScript |
| Web | Next.js 15, React, PWA |
| API | Node.js, GraphQL (Apollo Server), REST for B2B |
| Reputation service | Python, FastAPI, event-sourced, Redis cache |
| AI/ML | Python, fine-tuned LLM (content classification), RAG (claim verification), GNN (bot detection) |
| Primary DB | PostgreSQL 16, partitioned, read replicas |
| Graph DB | Neo4j (social graph, reputation relationships, collusion detection) |
| Event streaming | Apache Kafka |
| Search | Elasticsearch (full-text + semantic via embeddings) |
| Object storage | AWS S3 / Cloudflare R2 |
| Infrastructure | AWS/GCP, Kubernetes, Terraform, GitHub Actions CI/CD |

---

## Core Systems

### 1. Hybrid Reputation Engine

**Formula:**
```
HYBRID_SCORE = (FOUNDATION * 0.30) + (ACTIVE * 0.70)

FOUNDATION = clamp(all_time_accuracy_rate * 100, floor=15, ceil=100)
ACTIVE = clamp(base_50 + sum(weekly_deltas * recency_weight), floor=0, ceil=100)
```

**Recency weights (13-week rolling window):**
- Week 1: 1.00, Week 2: 0.92, Week 3: 0.85, Week 4: 0.78
- Week 5: 0.72, Week 6: 0.65, Week 7: 0.58, Week 8: 0.50
- Week 9: 0.42, Week 10: 0.35, Week 11: 0.28, Week 12: 0.20, Week 13: 0.12

**Signal weights:**
- Positive: verified_claim +3.0, credible_reaction +0.15, helpful_note +2.0, source_link +0.5, successful_appeal +4.0, accurate_dispute +1.0
- Negative: debunked_claim -5.0, upheld_dispute -0.25, upheld_report -8.0, frivolous_report -2.0, misclassification -1.5, coordinated_flag -30.0

**Reach tiers (based on ACTIVE score only):**
- Full reach: 75+
- Standard: 50-74
- Reduced: 25-49
- Sandboxed: 0-24

**Domain-specific:** Scores are independent per domain (science, health, politics, technology, environment, economics, local_news, breaking_news, history, sports). Cross-domain influence is zero.

**Anti-gaming:** Weekly caps on positive signals, asymmetric negative scoring, reporter reputation gating (reports from <25 rep users are ignored), coordinated attack detection (20+ reports in 1 hour from similar accounts = freeze), 2-week probation sandbox for new accounts.

### 2. Engagement Model

Replace likes/dislikes/follows with:
- **Credible** (swipe right) — "I believe this is accurate." Only affects rep on fact-claims.
- **Dispute** (swipe left) — Requires reason: inaccurate, misleading context, missing source, outdated.
- **Trust** (long press) — Domain-specific. Trust @user in "science" ≠ trust them in "politics."

### 3. Content Classification

Every post is tagged at creation: fact-claim, opinion, satire, question, or personal experience. User selects, AI suggests corrections. Misclassification costs -1.5 rep.

### 4. Neighborhoods (Local System)

- Users get a "Neighborhood" based on location (~2km radius).
- Neighborhood tab is the default home screen.
- Anyone can report a problem: take in-app photo + drop pin + select category.
- Issues escalate to "Active" when 3+ unique neighbors confirm with their own photos.
- Missions follow lifecycle: Identify → Research → Propose → Act → Measure.
- Resolution requires 5 independent verifiers with their own photos + 48-hour dispute window.
- 7-day re-verification for infrastructure fixes.
- Solved missions stay visible permanently as proof.

### 5. Scope System (Local → Global)

| Scope | Radius | Verifiers needed | Auto-escalation trigger |
|---|---|---|---|
| Street | 200m | 3 within 200m | — |
| Neighborhood | 2km | 5 from different streets | 3+ street missions same category |
| City | Municipal boundary | 50+ from 5+ neighborhoods | 5+ neighborhoods same issue |
| National | Country | 500+ from 10+ cities | 10+ cities same issue |
| Global | Worldwide | International data sources | 3+ countries same issue |

### 6. Verification Pipeline (Anti-Fraud)

Six layers, in order:

1. **Device & location** (instant): Live GPS match within 200m, timestamp freshness <15min, device attestation (SafetyNet/DeviceCheck), network fingerprint vs GPS.
2. **AI image analysis** (instant): AI-generated detection, manipulation/ELA scan, reverse image search, relevance matching (does image match category?).
3. **Community cross-verification** (minutes): 3+ unique neighbor confirmations with diverse photos, reputation-weighted.
4. **Resolution verification**: Before/after photo matching, 5-verifier rule, 7-day re-verification, 48-hour dispute window.
5. **Pattern detection** (ongoing): Frequency analysis (5+/week flagged), resolution rate tracking, collusion ring detection via graph analysis.
6. **Consequences**: Fake = -15 rep, 90-day pre-approval after 1 fake, permanent pre-approval after 2, visible "fake - debunked" tag on profile.

**Camera-first rule:** Issue reports and resolution claims MUST use in-app camera. Gallery uploads blocked for these. Gallery allowed only for supplementary evidence (screenshots of official responses), marked as "unverified."

### 7. Gamification System

**XP & Levels:**
- Every action earns XP. Levels unlock abilities.
- Level 1-2 "Observer": report, join, verify
- Level 3-4 "Contributor": create missions, propose solutions
- Level 5-7 "Changemaker": coordinate missions, mentor
- Level 8-10 "Problem Solver": city-scope missions, expert voting
- Level 11+ "Catalyst": national missions, community moderator

**Daily quests:** 4 quick tasks per day (~2 min each), contextual to neighborhood activity. Completing all 4 = bonus XP. Quests rotate daily.

**Badges:** Earned through specific real contributions (First Responder, Fixer, Truth Seeker, Neighborhood Hero, Bridge Builder, Streak Master, City Catalyst, Global Solver).

**Streaks:** Daily activity streak with 2 free freezes/month. Logarithmic bonuses (Day 1-7: +5 XP/day, Day 8-30: +10, Day 31-90: +15, Day 91+: +20).

**Leaderboards:** Neighborhood-first (weekly reset), then city (unlocks at Level 8). Based on verified impact, not raw activity. Always show "X XP to next rank."

**Anti-addiction:** Daily XP cap (200/day), "you're caught up" endpoint, no notifications 10PM-7AM default, weekly impact summary instead of daily stats.

### 8. UX Principles

- **3-tap rule:** Every core action completable in 3 taps from home screen.
- **Swipe interaction:** Right = Credible, Left = Dispute, Long press = Trust.
- **No follower counts, no selfies, no "posts" tab** on profiles. Identity = level + badges + impact.
- **Micro-celebrations:** Level-up animation, mission-solved confetti, streak milestones, ripple effect notifications ("Your template used in Pune!"), badge unlock envelopes.
- **Progress notifications** replace likes: "Your solution got 47 credible endorsements," not "X liked your post."

---

## Database Schema (PostgreSQL)

See the full schema in `reputation_engine.py`. Key tables:
- `users` — identity, verification, probation status, coordinated behavior flag
- `reputation_scores` — materialized scores per user per domain
- `weekly_deltas` — 13-week rolling window snapshots
- `reputation_events` — append-only event log (immutable for auditability)
- `reports` — with reporter weight, coordinated attack detection
- `missions` — lifecycle stages, scope, verification status
- `mission_participants` — roles, contributions, XP earned
- `images` — authenticity scores, verification pipeline results

---

## MVP Build Order (Months 1-6)

### Month 1-2: Foundation
- Auth (phone + email + device fingerprint)
- User profiles with domain reputation display
- PostgreSQL schema
- GraphQL API layer
- React Native shell with navigation
- Basic feed rendering
- CI/CD pipeline

### Month 3-4: Core Features
- Reputation engine (hybrid scoring, weekly recalculation)
- Content classification (fact/opinion/satire tagging)
- Credible/Dispute/Trust interactions (swipe gestures)
- Neighborhood system (location-based, 2km radius)
- Issue reporting (camera-first, GPS verification)
- Community confirmation flow
- Fake profile defense layers 1-2

### Month 5-6: MVP Launch
- Mission boards with lifecycle stages
- Resolution verification (5-verifier rule)
- XP system, levels, daily quests
- Badges and streak system
- Neighborhood leaderboard
- Image verification pipeline (AI-gen detection, manipulation scan)
- Invite-only beta with 500 seed users

---

## Revenue Model

- Premium subscriptions (35%): $8/month. Advanced analytics, priority verification, expert tools.
- Verification API B2B (25%): Newsrooms and researchers pay for claim-checking API.
- Institutional licenses (20%): Universities, government, NGOs.
- Impact marketplace (12%): Platform fee on expert consultations and project tools.
- Anonymized data insights (8%): Aggregated trend data for researchers and policy orgs.

---

## Key Files

- `reputation_engine.py` — Complete scoring algorithm, anti-gaming protections, DB schema
- `TruthLayer_Product_Vision.docx` — Full strategy document for investors/co-founders
