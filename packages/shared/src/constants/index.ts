// Reputation domains
export const REPUTATION_DOMAINS = [
  'science',
  'health',
  'politics',
  'technology',
  'environment',
  'economics',
  'local_news',
  'breaking_news',
  'history',
  'sports',
] as const

export type ReputationDomain = (typeof REPUTATION_DOMAINS)[number]

// Reach tier thresholds (based on ACTIVE score)
export const REACH_TIERS = {
  FULL: 75,
  STANDARD: 50,
  REDUCED: 25,
  SANDBOXED: 0,
} as const

export type ReachTier = keyof typeof REACH_TIERS

// Gamification
export const DAILY_XP_CAP = 200

export const LEVEL_TITLES = {
  OBSERVER: { min: 1, max: 2, title: 'Observer' },
  CONTRIBUTOR: { min: 3, max: 4, title: 'Contributor' },
  CHANGEMAKER: { min: 5, max: 7, title: 'Changemaker' },
  PROBLEM_SOLVER: { min: 8, max: 10, title: 'Problem Solver' },
  CATALYST: { min: 11, max: Infinity, title: 'Catalyst' },
} as const

// Queue names (BullMQ)
export const QUEUES = {
  REPUTATION_RECALC: 'reputation-recalc',
  IMAGE_VERIFICATION: 'image-verification',
  NOTIFICATIONS: 'notifications',
  SEARCH_INDEX: 'search-index',
  POST_REACTIONS: 'post-reactions',
} as const

// Scope system
export const SCOPE_VERIFIER_REQUIREMENTS = {
  STREET: 3,
  NEIGHBORHOOD: 5,
  CITY: 50,
  NATIONAL: 500,
  GLOBAL: 0, // international data sources
} as const

export type Scope = keyof typeof SCOPE_VERIFIER_REQUIREMENTS

// Content classification types
export const CONTENT_TYPES = [
  'fact_claim',
  'opinion',
  'satire',
  'question',
  'personal_experience',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

// Mission lifecycle stages
export const MISSION_STAGES = [
  'identify',
  'research',
  'propose',
  'act',
  'measure',
] as const

export type MissionStage = (typeof MISSION_STAGES)[number]

// Post engagement reactions (runtime array — type ReactionType comes from @prisma/client)
export const REACTION_TYPES = ['credible', 'dispute', 'trust'] as const

// Slow-mode reasons (context over censorship — tag + slow, never remove)
// Runtime array — type SlowModeReason comes from @prisma/client
export const SLOW_MODE_REASONS = [
  'low_reputation_source',
  'coordinated_flag',
  'misclassification',
  'disputed_claim',
] as const

// Mission participant roles (runtime array — type MissionParticipantRole comes from @prisma/client)
export const MISSION_PARTICIPANT_ROLES = [
  'verifier',
  'contributor',
  'coordinator',
  'mentor',
] as const

// Reputation signal weights
export const SIGNAL_WEIGHTS = {
  // Positive
  SUCCESSFUL_APPEAL: 4.0,
  VERIFIED_CLAIM: 3.0,
  HELPFUL_NOTE: 2.0,
  ACCURATE_DISPUTE: 1.0,
  SOURCE_LINK: 0.5,
  CREDIBLE_REACTION: 0.15,
  // Negative
  COORDINATED_FLAG: -30.0,
  UPHELD_REPORT: -8.0,
  DEBUNKED_CLAIM: -5.0,
  FRIVOLOUS_REPORT: -2.0,
  MISCLASSIFICATION: -1.5,
  UPHELD_DISPUTE: -0.25,
} as const
