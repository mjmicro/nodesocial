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
