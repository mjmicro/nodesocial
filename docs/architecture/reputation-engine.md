# Reputation Engine

Implementation: `services/reputation/src/engine/reputation_engine.py` (757 lines, production-ready)

## Formula

```
HYBRID_SCORE = (FOUNDATION * 0.30) + (ACTIVE * 0.70)

FOUNDATION = clamp(all_time_accuracy_rate * 100, floor=15, ceil=100)
ACTIVE     = clamp(base_50 + sum(weekly_deltas * recency_weight), floor=0, ceil=100)
```

## Recency Weights (13-week rolling window)

| Week | Weight | Week | Weight |
|------|--------|------|--------|
| 1 | 1.00 | 8 | 0.50 |
| 2 | 0.92 | 9 | 0.42 |
| 3 | 0.85 | 10 | 0.35 |
| 4 | 0.78 | 11 | 0.28 |
| 5 | 0.72 | 12 | 0.20 |
| 6 | 0.65 | 13 | 0.12 |
| 7 | 0.58 | | |

## Signal Weights

**Positive:**
| Signal | Weight |
|--------|--------|
| successful_appeal | +4.0 |
| verified_claim | +3.0 |
| helpful_note | +2.0 |
| accurate_dispute | +1.0 |
| source_link | +0.5 |
| credible_reaction | +0.15 |

**Negative:**
| Signal | Weight |
|--------|--------|
| coordinated_flag | -30.0 |
| upheld_report | -8.0 |
| debunked_claim | -5.0 |
| frivolous_report | -2.0 |
| misclassification | -1.5 |
| upheld_dispute | -0.25 |

## Reach Tiers (ACTIVE score only)

| Tier | Score | Effect |
|------|-------|--------|
| Full reach | 75+ | Normal distribution |
| Standard | 50–74 | Normal distribution |
| Reduced | 25–49 | Shown to fewer users |
| Sandboxed | 0–24 | Only visible to self + followers |

## Domains (independent scores, zero cross-domain influence)

`science` · `health` · `politics` · `technology` · `environment` · `economics` · `local_news` · `breaking_news` · `history` · `sports`

## Anti-Gaming Protections

- Weekly caps on all positive signals
- Reports from users with rep <25 are silently ignored
- Coordinated attack detection: 20+ reports in 1 hour from similar accounts = account freeze
- New accounts: 2-week probation sandbox regardless of score
- Asymmetric scoring: negatives always outweigh positives of the same magnitude

## NestJS Integration

- `ReputationModule` reads scores from **Upstash Redis** cache (hot path — never hits DB directly)
- Score updates are enqueued as **BullMQ jobs** → Python service recalculates → writes back to PostgreSQL + Redis
- Never call the Python service synchronously from a request handler
- Cache key pattern: `rep:{userId}:{domain}`
- Cache TTL: 5 minutes for active users, 1 hour for inactive
