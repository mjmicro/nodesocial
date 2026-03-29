import { z } from 'zod'

export const RegisterSchema = z.object({
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be at most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Handle must be lowercase alphanumeric or underscores'),
  displayName: z.string().min(1, 'Display name is required').max(60).trim(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshInput = z.infer<typeof RefreshSchema>
