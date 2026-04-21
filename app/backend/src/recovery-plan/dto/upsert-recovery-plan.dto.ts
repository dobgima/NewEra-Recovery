import { z } from 'zod';

export const upsertRecoveryPlanSchema = z.object({
  goals: z
    .array(z.string().min(2).max(200))
    .min(1, 'At least one goal is required')
    .max(10, 'Too many goals'),
  copingTools: z
    .array(z.string().min(2).max(200))
    .min(1, 'At least one coping tool is required')
    .max(20, 'Too many coping tools'),
  commitments: z
    .array(z.string().min(2).max(200))
    .min(1, 'At least one commitment is required')
    .max(10, 'Too many commitments'),
});

export type UpsertRecoveryPlanDto = z.infer<typeof upsertRecoveryPlanSchema>;