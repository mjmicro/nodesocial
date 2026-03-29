import { z } from 'zod'
import { GEO_PAIR_MSG, latField, latLngPaired, lngField } from './geo'

export const UpdateProfileSchema = z
  .object({
    displayName: z.string().min(1, 'Display name cannot be empty').max(60).trim().optional(),
    lat: latField.optional(),
    lng: lngField.optional(),
  })
  .refine(latLngPaired, { message: GEO_PAIR_MSG })

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
