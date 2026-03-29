import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'
import type { Env } from '../config/env.schema'

export const SUPABASE_CLIENT = Symbol('SUPABASE_CLIENT')

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createClient(
          config.getOrThrow('SUPABASE_URL'),
          config.getOrThrow('SUPABASE_SERVICE_KEY'),
        ),
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
