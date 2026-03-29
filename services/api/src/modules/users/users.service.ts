import { Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@truthlayer/database'
import { DatabaseService } from '../../database/database.service'
import { toFullProfile, toPublicProfile } from './utils/profile.mapper'
import type { FullProfile, PublicProfile, UpdateProfileInput } from '@truthlayer/shared'

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async getOwnProfile(userId: string): Promise<FullProfile> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { reputationScores: true },
    })
    if (!user) throw new NotFoundException('User not found')
    return toFullProfile(user)
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<FullProfile> {
    const updateData: Prisma.UserUpdateInput = {}
    if (input.displayName !== undefined) updateData.displayName = input.displayName
    if (input.lat !== undefined) updateData.lat = input.lat
    if (input.lng !== undefined) updateData.lng = input.lng

    try {
      const user = await this.db.user.update({
        where: { id: userId },
        data: updateData,
        include: { reputationScores: true },
      })
      return toFullProfile(user)
    } catch (err: unknown) {
      if (isPrismaError(err, 'P2025')) throw new NotFoundException('User not found')
      throw err
    }
  }

  async getPublicProfile(handle: string): Promise<PublicProfile> {
    const user = await this.db.user.findUnique({
      where: { handle },
      include: { reputationScores: true },
    })
    if (!user) throw new NotFoundException('User not found')
    return toPublicProfile(user)
  }
}

function isPrismaError(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === code
  )
}
