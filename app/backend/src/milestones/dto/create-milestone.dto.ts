import { z } from 'zod';

export const createMilestoneSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(500).optional(),
  achievedAt: z.string().datetime(),
  badgeCode: z.string().min(2).max(50).optional(),
});

export type CreateMilestoneDto = z.infer<typeof createMilestoneSchema>;