import { z } from 'zod'
import { MISSION_STAGES, REPUTATION_DOMAINS, SCOPES } from '../constants'
import { latField, lngField } from './geo'

export const CreateMissionSchema = z.object({
  title: z.string().min(1).max(120).trim(),
  description: z.string().min(1).max(2000).trim(),
  category: z.enum(REPUTATION_DOMAINS),
  scope: z.enum(SCOPES),
  lat: latField,
  lng: lngField,
  primaryReportId: z.string().uuid().optional(),
})

export type CreateMissionInput = z.infer<typeof CreateMissionSchema>

export const UpdateMissionSchema = z.object({
  stage: z.enum(MISSION_STAGES),
})

export type UpdateMissionInput = z.infer<typeof UpdateMissionSchema>
