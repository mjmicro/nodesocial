import { ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import type { SupabaseClient } from '@supabase/supabase-js'
import { DatabaseService } from '../../database/database.service'
import { SUPABASE_CLIENT } from '../../supabase/supabase.module'
import { toFullProfile } from '../users/utils/profile.mapper'
import type { FullProfile } from '../users/utils/profile.mapper'
import type { RegisterInput } from '@truthlayer/shared'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async register(userId: string, input: RegisterInput): Promise<FullProfile> {
    const [existing, { data: adminData, error }] = await Promise.all([
      this.db.user.findUnique({ where: { handle: input.handle }, select: { id: true } }),
      this.supabase.auth.admin.getUserById(userId),
    ])

    if (existing && existing.id !== userId) throw new ConflictException('Handle already taken')
    if (error || !adminData.user) throw new InternalServerErrorException('Could not retrieve auth user')

    const user = await this.db.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        handle: input.handle,
        displayName: input.displayName,
        email: adminData.user.email ?? null,
      },
      update: {},
      include: { reputationScores: true },
    })

    return toFullProfile(user)
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) throw new UnauthorizedException('Invalid refresh token')

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  }
}
