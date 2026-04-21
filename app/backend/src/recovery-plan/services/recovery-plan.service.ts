import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors/app-error';
import { UpsertRecoveryPlanDto } from '../dto/upsert-recovery-plan.dto';
import { MilestonesService } from '../../milestones/services/milestones.service';

const milestonesService = new MilestonesService();

export class RecoveryPlanService {
  async getMine(userId: string) {
    const plan = await prisma.recoveryPlan.findUnique({
      where: { userId },
    });

    if (!plan) {
      throw new AppError('Recovery plan not found', 404);
    }

    return plan;
  }

  async upsert(userId: string, dto: UpsertRecoveryPlanDto) {
    const dedupedGoals = [...new Set(dto.goals.map((g) => g.trim()))];
    const dedupedCopingTools = [...new Set(dto.copingTools.map((c) => c.trim()))];
    const dedupedCommitments = [...new Set(dto.commitments.map((c) => c.trim()))];

    if (dedupedGoals.length === 0) {
      throw new AppError('At least one valid goal is required', 400);
    }

    if (dedupedCopingTools.length === 0) {
      throw new AppError('At least one valid coping tool is required', 400);
    }

    if (dedupedCommitments.length === 0) {
      throw new AppError('At least one valid commitment is required', 400);
    }

    const plan = await prisma.recoveryPlan.upsert({
      where: { userId },
      update: {
        goals: dedupedGoals,
        copingTools: dedupedCopingTools,
        commitments: dedupedCommitments,
      },
      create: {
        userId,
        goals: dedupedGoals,
        copingTools: dedupedCopingTools,
        commitments: dedupedCommitments,
      },
    });

    return plan;
  }
}