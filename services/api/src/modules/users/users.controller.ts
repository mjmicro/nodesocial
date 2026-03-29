import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { UpdateProfileSchema } from '@truthlayer/shared'
import type { UpdateProfileInput } from '@truthlayer/shared'

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() userId: string) {
    return this.usersService.getOwnProfile(userId)
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(userId, body)
  }

  @Get(':handle')
  async getByHandle(@Param('handle') handle: string) {
    return this.usersService.getPublicProfile(handle)
  }
}
