import { Global, Module }  from '@nestjs/common'
import { BullModule }      from '@nestjs/bullmq'
import { ConfigService }   from '@nestjs/config'
import type { Env }        from '../config/env.schema'

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const raw = config.getOrThrow('REDIS_URL')
        const url = new URL(raw)
        return {
          connection: {
            host:                 url.hostname,
            port:                 Number(url.port) || 6380,
            password:             url.password || undefined,
            tls:                  url.protocol === 'rediss:' ? {} : undefined,
            maxRetriesPerRequest: null,  // required by BullMQ
            enableReadyCheck:     false,
          },
        }
      },
    }),
  ],
  // Feature modules register their own queues via BullModule.registerQueue({ name: QUEUES.X })
  exports: [BullModule],
})
export class QueueModule {}
