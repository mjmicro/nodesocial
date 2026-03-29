import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard'

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
