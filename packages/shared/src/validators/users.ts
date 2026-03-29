import { z } from 'zod'

export const UpdateProfileSchema = z
  .object({
    displayName: z.string().min(1, 'Display name cannot be empty').max(60).trim().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .refine(
    (data) => {
      const hasLat = data.lat !== undefined
      const hasLng = data.lng !== undefined
      return hasLat === hasLng
    },
    { message: 'lat and lng must both be provided or both omitted' },
  )

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
