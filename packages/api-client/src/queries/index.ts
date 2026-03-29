import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../client'
import { queryKeys } from '../query-keys'
import type {
  User,
  ReputationScore,
  ReputationDomain,
  ExpertiseLevel,
  ReachTier,
} from '@truthlayer/database'

// ---- Response shapes --------------------------------------------------------

export type OwnProfileResponse = User & {
  reputationScores: ReputationScore[]
}

export type PublicProfileResponse = Pick<
  User,
  'id' | 'handle' | 'displayName' | 'xp' | 'level' | 'createdAt'
> & {
  reputationScores: Array<{
    domain: ReputationDomain
    hybridScore: number
    expertiseLevel: ExpertiseLevel
    reachTier: ReachTier
  }>
}

// ---- Hooks ------------------------------------------------------------------

/**
 * Fetch the authenticated user's own profile including all reputation scores.
 * Only runs when a token is present.
 */
export function useOwnProfile(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => apiRequest<OwnProfileResponse>('/users/me', { token }),
    enabled: Boolean(token),
    staleTime: 30_000,
  })
}

/**
 * Fetch a user's public profile by handle.
 */
export function usePublicProfile(handle: string, token?: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(handle),
    queryFn: () => apiRequest<PublicProfileResponse>(`/users/${handle}`, { token }),
    enabled: Boolean(handle),
    staleTime: 60_000,
  })
}
