import { z } from 'zod'

export const latField = z.number().min(-90).max(90)
export const lngField = z.number().min(-180).max(180)

export const GEO_PAIR_MSG = 'lat and lng must both be provided or both omitted'

export const latLngPaired = (d: { lat?: number; lng?: number }) =>
  (d.lat === undefined) === (d.lng === undefined)
