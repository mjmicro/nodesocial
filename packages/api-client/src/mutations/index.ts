import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../client'
import { queryKeys } from '../query-keys'
import type { FullProfile, RegisterInput, UpdateProfileInput } from '@truthlayer/shared'

export function useRegister(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<{ id: string }>('/auth/register', { method: 'POST', token, body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() })
    },
  })
}

export function useUpdateProfile(token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiRequest<FullProfile>('/users/me', { method: 'PATCH', token, body: input }),
    onSuccess: (updated) => {
      // Optimistic update — avoids a refetch round-trip
      queryClient.setQueryData(queryKeys.users.me(), updated)
    },
  })
}

export function useRefreshSession() {
  return useMutation({
    mutationFn: (refreshToken: string) =>
      apiRequest<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }),
  })
}
