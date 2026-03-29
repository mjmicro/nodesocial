# Engagement Model & Content Classification

## Two Content Tracks

TruthLayer has two parallel content surfaces — users can participate in either or both:

| Track | Model | Created by | Core action |
|-------|-------|-----------|-------------|
| **Civic** | `Report` → `Mission` | Camera + GPS mandatory | File issue, confirm, solve |
| **Social** | `Post` | Text-first, photo optional | Share, fact-check, discuss |

Posts are **never deleted**. Moderation = `isSlowed` flag + `slowReason` label on the post. The community sees context, not a void.

---

## Engagement Actions on Posts (replaces likes/follows)

| Action | Gesture | Prisma model | Meaning | Rep effect |
|--------|---------|-------------|---------|------------|
| **Credible** | Swipe right | `PostReaction { reaction: CREDIBLE }` | "I believe this is accurate" | Affects rep only on `FACT_CLAIM` posts |
| **Dispute** | Swipe left | `PostReaction { reaction: DISPUTE }` | "This is wrong or misleading" | Requires a reason (see below) |
| **Trust** | Long press | `PostReaction { reaction: TRUST }` | "I trust this person in this domain" | Domain-specific, not global |

One reaction per user per post (`@@unique([postId, userId])`). Changing reaction updates the existing row.

### Dispute reasons (required)
- Inaccurate information
- Misleading context
- Missing source
- Outdated information

### Trust model
- Trust is **domain-specific**: trusting @user in `science` ≠ trusting them in `politics`
- Trust affects how their content is weighted in your feed
- No public "follower count" — trust is private and directional

---

## Content Classification (`ContentType`)

Every post is tagged at creation. User selects, AI suggests a correction if it disagrees.

| Type | DB value | Description |
|------|----------|-------------|
| Fact claim | `fact_claim` | Asserts something is objectively true |
| Opinion | `opinion` | Personal view or interpretation |
| Satire | `satire` | Clearly labelled humorous/satirical content |
| Question | `question` | Asking for information or opinions |
| Personal experience | `personal_experience` | First-person account, not a general claim |

- Misclassification (AI-confirmed): **-1.5 rep** via BullMQ
- Only `FACT_CLAIM` posts are eligible for Credible/Dispute rep effects
- `OPINION` and `PERSONAL_EXPERIENCE` posts cannot be Disputed on accuracy grounds

### Optional domain tag (`ReputationDomain`)
Fact claims can be tagged with a domain (science, health, politics, etc.) to feed domain-specific reputation scoring. Other content types can be tagged too, but only `FACT_CLAIM` generates rep signal.

---

## Slow Mode

Posts are never removed. When flagged:
- `Post.isSlowed = true`
- `Post.slowReason` set to one of: `low_reputation_source` | `coordinated_flag` | `misclassification` | `disputed_claim`
- Post renders with a visible context label explaining why it's limited
- Distribution is throttled, not zeroed

---

## Profile Design

No follower counts. No selfies. No "posts" tab.

Identity = **Level + Badges + Impact score**

Profile shows:
- Current level + title
- Earned badges
- Neighborhoods active in
- Missions contributed to
- Domain reputation bars (per domain, not a single number)

---

## UX Principles

- **3-tap rule:** Every core action completable in 3 taps from home screen
- **Micro-celebrations:** Level-up animation, mission-solved confetti, streak milestones, badge unlock envelopes
- **Progress notifications** replace engagement notifications:
  - ✓ "Your solution got 47 credible endorsements"
  - ✗ "X liked your post"
- **Ripple notifications:** "Your mission template was used in Pune!" — shows real-world spread
