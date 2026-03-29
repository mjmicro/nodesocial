/**
 * Centralised query key factory.
 * Keeps cache invalidation predictable — always invalidate by the narrowest
 * key prefix that covers the stale data.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.users.me() })
 */
export const queryKeys = {
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    profile: (handle: string) => [...queryKeys.users.all, 'profile', handle] as const,
  },
} as const
