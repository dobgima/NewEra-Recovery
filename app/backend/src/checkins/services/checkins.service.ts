import { RiskLevel } from '@prisma/client';
import { prisma } from '../../common/db/prisma';
import { MilestonesService } from '../../milestones/services/milestones.service';
import { RiskEngineService } from '../../risk-engine/services/risk-engine.service';
import { CreateCheckInDto } from '../dto/create-checkin.dto';
import { CheckInResponseDto } from '../dto/checkin-response.dto';

const riskEngine = new RiskEngineService();
const milestonesService = new MilestonesService();

export class CheckinsService {
  async create(userId: string, dto: CreateCheckInDto): Promise<CheckInResponseDto> {
    const priorCheckinsCount = await prisma.checkIn.count({
      where: { userId },
    });

    const assessment = riskEngine.assess({
      mood: dto.mood,
      cravingsLevel: dto.cravingsLevel,
      triggers: dto.triggers,
      notes: dto.notes,
      feltUnsafe: dto.feltUnsafe,
      needsSupport: dto.needsSupport,
    });

    const { checkIn, riskScore } = await prisma.$transaction(async (tx) => {
      const checkIn = await tx.checkIn.create({
        data: {
          userId,
          mood: dto.mood,
          cravingsLevel: dto.cravingsLevel,
          triggers: dto.triggers,
          notes: dto.notes,
          feltUnsafe: dto.feltUnsafe,
          needsSupport: dto.needsSupport,
        },
      });

      const riskScore = await tx.riskScore.create({
        data: {
          checkInId: checkIn.id,
          score: assessment.score,
          level: assessment.level,
          explanation: assessment.explanation,
          factors: assessment.factors,
          recommendedAction: assessment.recommendedAction,
          encouragement: assessment.encouragement,
          crisisEscalation: assessment.crisisEscalation,
        },
      });

      return { checkIn, riskScore };
    });

    const streak = await this.calculateCheckinStreak(userId);

    await this.awardMilestones(userId, priorCheckinsCount, streak);

    let crisisPlan = null;

    if (
      assessment.level === RiskLevel.HIGH ||
      assessment.level === RiskLevel.CRITICAL
    ) {
      crisisPlan = await prisma.crisisPlan.findUnique({
        where: { userId },
      });
    }

    return {
      checkIn,
      riskAssessment: {
        id: riskScore.id,
        checkInId: riskScore.checkInId,
        score: riskScore.score,
        level: riskScore.level,
        explanation: riskScore.explanation,
        factors: riskScore.factors as typeof assessment.factors,
        recommendedAction: riskScore.recommendedAction,
        encouragement: riskScore.encouragement,
        crisisEscalation: riskScore.crisisEscalation,
        createdAt: riskScore.createdAt,
      },
      engagement: {
        currentStreak: streak,
      },
      crisisPlan,
    };
  }

  async getMine(userId: string) {
    return prisma.checkIn.findMany({
      where: { userId },
      include: {
        riskScore: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });
  }

  private async awardMilestones(
    userId: string,
    priorCheckinsCount: number,
    streak: number,
  ): Promise<void> {
    if (priorCheckinsCount === 0) {
      await milestonesService.createIfNotExists({
        userId,
        title: 'Completed first check-in',
        description: 'Recorded the first recovery check-in.',
        badgeCode: 'FIRST_CHECKIN',
      });
    }

    if (streak >= 3) {
      await milestonesService.createIfNotExists({
        userId,
        title: '3-day check-in streak',
        description: 'Checked in 3 days in a row.',
        badgeCode: 'CHECKIN_STREAK_3',
      });
    }

    if (streak >= 7) {
      await milestonesService.createIfNotExists({
        userId,
        title: '7-day check-in streak',
        description: 'Checked in 7 days in a row.',
        badgeCode: 'CHECKIN_STREAK_7',
      });
    }
  }

  private async calculateCheckinStreak(userId: string): Promise<number> {
    const checkins = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
      take: 30,
    });

    if (checkins.length === 0) return 0;

    const uniqueDays = new Set(
      checkins.map((c) => c.createdAt.toISOString().slice(0, 10)),
    );

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