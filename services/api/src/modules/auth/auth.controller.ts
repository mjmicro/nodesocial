import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { RegisterSchema, RefreshSchema } from '@truthlayer/shared'
import type { RegisterInput, RefreshInput } from '@truthlayer/shared'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(SupabaseAuthGuard)
  async register(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterInput,
  ) {
    return this.authService.register(userId, body)
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body(new ZodValidationPipe(RefreshSchema)) body: RefreshInput) {
    return this.authService.refresh(body.refreshToken)
  }
}
