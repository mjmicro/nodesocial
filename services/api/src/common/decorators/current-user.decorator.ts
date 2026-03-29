import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest } from '../guards/supabase-auth.guard'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.userId
  },
)
