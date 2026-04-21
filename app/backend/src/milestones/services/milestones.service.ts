import { prisma } from '../../common/db/prisma';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';

export class MilestonesService {
  async create(userId: string, dto: CreateMilestoneDto) {
    const milestone = await prisma.milestone.create({
      data: {
        userId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        achievedAt: new Date(dto.achievedAt),
        badgeCode: dto.badgeCode?.trim(),
      },
    });

    return milestone;
  }

  async createIfNotExists(params: {
    userId: string;
    title: string;
    description?: string;
    badgeCode?: string;
    achievedAt?: Date;
  }) {
    if (!params.badgeCode) {
      return prisma.milestone.create({
        data: {
          userId: params.userId,
          title: params.title.trim(),
          description: params.description?.trim(),
          badgeCode: params.badgeCode,
          achievedAt: params.achievedAt ?? new Date(),
        },
      });
    }

    const existing = await prisma.milestone.findFirst({
      where: {
        userId: params.userId,
        badgeCode: params.badgeCode,
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.milestone.create({
      data: {
        userId: params.userId,
        title: params.title.trim(),
        description: params.description?.trim(),
        badgeCode: params.badgeCode,
        achievedAt: params.achievedAt ?? new Date(),
      },
    });
  }

  async getMine(userId: string) {
    return prisma.milestone.findMany({
      where: { userId },
      orderBy: { achievedAt: 'desc' },
      take: 100,
    });
  }

  async getSummary(userId: string) {
    const [milestones, userProfile, recentCheckins] = await Promise.all([
      prisma.milestone.findMany({
        where: { userId },
        orderBy: { achievedAt: 'desc' },
        take: 5,
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          sobrietyDate: true,
        },
      }),
      prisma.checkIn.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
        take: 30,
      }),
    ]);

    const totalMilestones = await prisma.milestone.count({
      where: { userId },
    });

    let sobrietyDays: number | null = null;
    if (userProfile?.sobrietyDate) {
      const now = new Date();
      const start = new Date(userProfile.sobrietyDate);
      const diffMs = now.getTime() - start.getTime();
      sobrietyDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    const currentCheckinStreak = this.calculateCheckinStreak(
      recentCheckins.map((c) => c.createdAt)
    );

    return {
      totalMilestones,
      recentMilestones: milestones,
      mostRecentMilestone: milestones[0] || null,
      sobrietyDays,
      currentCheckinStreak,
    };
  }

  private calculateCheckinStreak(dates: Date[]): number {
    if (!dates.length) return 0;

    const uniqueDays = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    let streak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date(today);
      expected.setUTCDate(today.getUTCDate() - i);
      const expectedDay = expected.toISOString().slice(0, 10);

      if (sortedDays[i] === expectedDay) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}