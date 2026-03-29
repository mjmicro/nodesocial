import type { User, ReputationScore } from '@truthlayer/database'
import type { FullProfile, PublicProfile, ReputationScoreItem } from '@truthlayer/shared'

export type UserWithScores = User & { reputationScores: ReputationScore[] }

function mapScore(s: ReputationScore): ReputationScoreItem {
  return {
    domain: s.domain,
    hybridScore: s.hybridScore,
    expertiseLevel: s.expertiseLevel,
    reachTier: s.reachTier,
  }
}

export function toFullProfile(u: UserWithScores): FullProfile {
  return {
    id: u.id,
    handle: u.handle,
    displayName: u.displayName,
    email: u.email,
    identityVerified: u.identityVerified,
    lat: u.lat,
    lng: u.lng,
    xp: u.xp,
    level: u.level,
    streakDays: u.streakDays,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    reputationScores: u.reputationScores.map(mapScore),
  }
}

export function toPublicProfile(u: UserWithScores): PublicProfile {
  return {
    handle: u.handle,
    displayName: u.displayName,
    identityVerified: u.identityVerified,
    xp: u.xp,
    level: u.level,
    reputationScores: u.reputationScores.map(mapScore),
  }
}
