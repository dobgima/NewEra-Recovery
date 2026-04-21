import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors/app-error';
import { UpsertCrisisPlanDto } from '../dto/upsert-crisis-plan.dto';
import { MilestonesService } from '../../milestones/services/milestones.service';

const milestonesService = new MilestonesService();

export class CrisisPlanService {
  async getMine(userId: string) {
    const plan = await prisma.crisisPlan.findUnique({
      where: { userId },
    });

    if (!plan) {
      throw new AppError('Crisis plan not found', 404);
    }

    return plan;
  }

  async upsert(userId: string, dto: UpsertCrisisPlanDto) {
    const existing = await prisma.crisisPlan.findUnique({
      where: { userId },
    });

    const warningSigns = [...new Set(dto.warningSigns.map((x) => x.trim()).filter(Boolean))];
    const copingSteps = [...new Set(dto.copingSteps.map((x) => x.trim()).filter(Boolean))];
    const emergencyInstructions = [
      ...new Set(dto.emergencyInstructions.map((x) => x.trim()).filter(Boolean)),
    ];
    const crisisLine = dto.crisisLine?.trim() || null;

    if (warningSigns.length === 0) {
      throw new AppError('At least one valid warning sign is required', 400);
    }

    if (copingSteps.length === 0) {
      throw new AppError('At least one valid coping step is required', 400);
    }

    if (emergencyInstructions.length === 0) {
      throw new AppError('At least one valid emergency instruction is required', 400);
    }

    const plan = await prisma.crisisPlan.upsert({
      where: { userId },
      update: {
        warningSigns,
        copingSteps,
        emergencyInstructions,
        crisisLine,
      },
      create: {
        userId,
        warningSigns,
        copingSteps,
        emergencyInstructions,
        crisisLine,
      },
    });

    if (!existing) {
      await milestonesService.createIfNotExists({
        userId,
        title: 'Created crisis plan',
        description: 'Created a personal crisis plan with warning signs, coping steps, and emergency instructions.',
        badgeCode: 'CRISIS_PLAN_CREATED',
      });
    }

    return plan;
  }
}