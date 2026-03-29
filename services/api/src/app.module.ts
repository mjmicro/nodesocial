import { Module }         from '@nestjs/common'
import { ConfigModule }   from '@nestjs/config'
import { AppController }  from './app.controller'
import { validateEnv }    from './config/env.schema'
import { DatabaseModule } from './database/database.module'
import { SupabaseModule } from './supabase/supabase.module'
import { QueueModule }    from './queue/queue.module'
import { AuthModule }     from './modules/auth/auth.module'
import { UsersModule }    from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, envFilePath: ['../../.env', '.env'] }),
    DatabaseModule,
    SupabaseModule,
    QueueModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
