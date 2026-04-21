import { prisma } from '../src/common/db/prisma';
import { MilestonesService } from '../src/milestones/services/milestones.service';

const milestonesService = new MilestonesService();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      recoveryPlan: true,
      crisisPlan: true,
      checkIns: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true },
      },
    },
  });

  for (const user of users) {
    if (user.recoveryPlan) {
      await milestonesService.createIfNotExists({
        userId: user.id,
        title: 'Created recovery plan',
        description:
          'Built a personal recovery plan with goals, coping tools, and commitments.',
        badgeCode: 'RECOVERY_PLAN_CREATED',
        achievedAt: user.recoveryPlan.createdAt,
      });
    }

    if (user.crisisPlan) {
      await milestonesService.createIfNotExists({
        userId: user.id,
        title: 'Created crisis plan',
        description:
          'Created a personal crisis plan with warning signs, coping steps, and emergency instructions.',
        badgeCode: 'CRISIS_PLAN_CREATED',
        achievedAt: user.crisisPlan.createdAt,
      });
    }

    if (user.checkIns.length > 0) {
      await milestonesService.createIfNotExists({
        userId: user.id,
        title: 'Completed first check-in',
        description: 'Recorded the first recovery check-in.',
        badgeCode: 'FIRST_CHECKIN',
        achievedAt: user.checkIns[0].createdAt,
      });
    }
  }

  console.log(`Backfilled milestones for ${users.length} user(s).`);
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });