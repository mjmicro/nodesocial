# Verification Pipeline

Six layers executed in order. All image verification jobs run via BullMQ — never synchronously.

## Camera-First Rule

Issue reports and resolution claims **MUST** use `expo-camera` (in-app capture only).
- Gallery uploads are **blocked** for reports and resolutions
- Gallery allowed only for supplementary evidence (e.g. screenshots of official responses)
- Supplementary gallery uploads are tagged `source: "unverified"` in the `Image` Prisma model

## Layer 1 — Device & Location (instant)

- Live GPS must match report pin within **200m**
- Timestamp freshness: photo must be taken **<15 minutes** before submission
- Device attestation: SafetyNet (Android) / DeviceCheck (iOS)
- Network fingerprint cross-checked vs GPS coordinates

## Layer 2 — AI Image Analysis (instant, async job)

- AI-generated image detection
- Manipulation / ELA (Error Level Analysis) scan
- Reverse image search (detect reused photos)
- Relevance matching: does the image content match the report category?

Tools: Hive Moderation API or Together AI for detection models.

## Layer 3 — Community Cross-Verification (minutes)

- Requires **3+ unique neighbor confirmations** with their own independent photos
- Verifiers must be within the neighborhood radius
- Votes are reputation-weighted (rep <25 = excluded)

## Layer 4 — Resolution Verification

- Before/after photo matching by AI
- **5 independent verifiers** required with their own photos
- **48-hour dispute window** after resolution is claimed
- **7-day re-verification** for infrastructure fixes (roads, pipes, etc.)

## Layer 5 — Pattern Detection (ongoing, background jobs)

- Frequency analysis: users submitting 5+ reports/week are flagged for review
- Resolution rate tracking: low resolution rates trigger manual review
- Collusion ring detection via graph analysis (PostgreSQL recursive CTEs → Neo4j later)

## Layer 6 — Consequences

| Violation | Consequence |
|-----------|-------------|
| 1st fake report | -15 rep + 90-day pre-approval queue |
| 2nd fake report | Permanent pre-approval queue |
| Confirmed fake | Visible "fake – debunked" tag on profile |

## Prisma Model: Image

Key fields on the `Image` model relevant to verification:
```
authenticityScore   Float     // 0.0–1.0, set by AI layer
isAiGenerated       Boolean
manipulationScore   Float
gpsLat / gpsLng     Float
capturedAt          DateTime  // device timestamp
source              Enum      // CAMERA | GALLERY
verificationStatus  Enum      // PENDING | PASSED | FAILED
```
