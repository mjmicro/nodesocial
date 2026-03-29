import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../client'
import { queryKeys } from '../query-keys'
import type { FullProfile, PublicProfile } from '@truthlayer/shared'

export type { FullProfile, PublicProfile }

/**
 * Fetch the authenticated user's own profile including all reputation scores.
 * Only runs when a token is present.
 */
export function useOwnProfile(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => apiRequest<FullProfile>('/users/me', { token }),
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
    queryFn: () => apiRequest<PublicProfile>(`/users/${handle}`, { token }),
    enabled: Boolean(handle),
    staleTime: 60_000,
  })
}
