# Engagement Model & Content Classification

## Engagement Actions (replaces likes/follows)

| Action | Gesture | Meaning | Rep effect |
|--------|---------|---------|------------|
| **Credible** | Swipe right | "I believe this is accurate" | Affects rep only on fact-claims |
| **Dispute** | Swipe left | "This is wrong or misleading" | Requires a reason (see below) |
| **Trust** | Long press | "I trust this person in this domain" | Domain-specific, not global |

### Dispute reasons (required)
- Inaccurate information
- Misleading context
- Missing source
- Outdated information

### Trust model
- Trust is **domain-specific**: trusting @user in "science" ≠ trusting them in "politics"
- Trust affects how their content is weighted in your feed
- No public "follower count" — trust is private and directional

## Content Classification

Every post is tagged at creation. User selects, AI suggests a correction if it disagrees.

| Type | Description |
|------|-------------|
| `fact-claim` | Asserts something is objectively true |
| `opinion` | Personal view or interpretation |
| `satire` | Clearly labelled humorous/satirical content |
| `question` | Asking for information or opinions |
| `personal_experience` | First-person account, not a general claim |

- Misclassification (AI-confirmed): **-1.5 rep**
- Only `fact-claim` posts are eligible for Credible/Dispute rep effects
- `opinion` and `personal_experience` posts cannot be Disputed on accuracy grounds

## Profile Design

No follower counts. No selfies. No "posts" tab.

Identity = **Level + Badges + Impact score**

Profile shows:
- Current level + title
- Earned badges
- Neighborhoods active in
- Missions contributed to
- Domain reputation bars (per domain, not a single number)

## UX Principles

- **3-tap rule:** Every core action completable in 3 taps from home screen
- **Micro-celebrations:** Level-up animation, mission-solved confetti, streak milestones, badge unlock envelopes
- **Progress notifications** replace engagement notifications:
  - ✓ "Your solution got 47 credible endorsements"
  - ✗ "X liked your post"
- **Ripple notifications:** "Your mission template was used in Pune!" — shows real-world spread
