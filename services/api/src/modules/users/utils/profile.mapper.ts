import type { User, ReputationScore } from '@truthlayer/database'

export type UserWithScores = User & { reputationScores: ReputationScore[] }

export interface ReputationScoreItem {
  domain: string
  hybridScore: number
  expertiseLevel: string
  reachTier: string
}

export interface FullProfile {
  id: string
  handle: string
  displayName: string
  email: string | null
  identityVerified: boolean
  lat: number | null
  lng: number | null
  xp: number
  level: number
  streakDays: number
  isActive: boolean
  createdAt: string
  reputationScores: ReputationScoreItem[]
}

export interface PublicProfile {
  handle: string
  displayName: string
  identityVerified: boolean
  xp: number
  level: number
  reputationScores: ReputationScoreItem[]
}

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
