import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:             z.string().url(),
  SUPABASE_URL:             z.string().url(),
  SUPABASE_ANON_KEY:        z.string().min(1),
  SUPABASE_SERVICE_KEY:     z.string().min(1),
  UPSTASH_REDIS_URL:        z.string().url(), // REST https:// — for @upstash/redis cache client (Day 9)
  UPSTASH_REDIS_TOKEN:      z.string().min(1),
  REDIS_URL:                z.string().min(1), // rediss:// — for BullMQ via ioredis
  CLOUDFLARE_R2_BUCKET:     z.string().min(1),
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID:         z.string().min(1),
  R2_SECRET_ACCESS_KEY:     z.string().min(1),
  TYPESENSE_HOST:           z.string().min(1),
  TYPESENSE_API_KEY:        z.string().min(1),
  JWT_SECRET:               z.string().min(32),
  REPUTATION_SERVICE_URL:   z.string().url(),
  PORT:                     z.coerce.number().default(3001),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)
  if (!result.success) {
    throw new Error(
      `Environment validation failed:\n${result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`,
    )
  }
  return result.data
}
