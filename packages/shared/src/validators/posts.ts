import { z } from 'zod'
import { CONTENT_TYPES, REACTION_TYPES, REPUTATION_DOMAINS } from '../constants'
import { GEO_PAIR_MSG, latField, latLngPaired, lngField } from './geo'

export const CreatePostSchema = z
  .object({
    contentType: z.enum(CONTENT_TYPES),
    domain: z.enum(REPUTATION_DOMAINS).optional(),
    body: z.string().min(1).max(5000).trim(),
    lat: latField.optional(),
    lng: lngField.optional(),
  })
  .refine(latLngPaired, { message: GEO_PAIR_MSG })

export type CreatePostInput = z.infer<typeof CreatePostSchema>

export const CreatePostReactionSchema = z.object({
  reaction: z.enum(REACTION_TYPES),
})

export type CreatePostReactionInput = z.infer<typeof CreatePostReactionSchema>
