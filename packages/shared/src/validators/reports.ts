import { z } from 'zod'
import { CONTENT_TYPES, REPUTATION_DOMAINS } from '../constants'
import { latField, lngField } from './geo'

export const CreateReportSchema = z.object({
  category: z.enum(REPUTATION_DOMAINS),
  contentType: z.enum(CONTENT_TYPES),
  lat: latField,
  lng: lngField,
  targetUserId: z.string().uuid().optional(),
  targetContentId: z.string().uuid().optional(),
})

export type CreateReportInput = z.infer<typeof CreateReportSchema>
