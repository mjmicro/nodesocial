import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FastifyRequest } from 'fastify'
import { SUPABASE_CLIENT } from '../../supabase/supabase.module'

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractToken(request)
    if (!token) throw new UnauthorizedException()

    const { data, error } = await this.supabase.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException()

    request.userId = data.user.id
    return true
  }

  private extractToken(request: FastifyRequest): string | undefined {
    const [type, token] = (request.headers.authorization ?? '').split(' ')
    return type === 'Bearer' ? token : undefined
  }
}
