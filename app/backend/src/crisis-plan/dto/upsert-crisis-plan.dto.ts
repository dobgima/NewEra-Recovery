import { z } from 'zod';

export const upsertCrisisPlanSchema = z.object({
  warningSigns: z
    .array(z.string().min(2).max(200))
    .min(1, 'At least one warning sign is required')
    .max(20, 'Too many warning signs'),

  copingSteps: z
    .array(z.string().min(2).max(200))
    .min(1, 'At least one coping step is required')
    .max(20, 'Too many coping steps'),

  emergencyInstructions: z
    .array(z.string().min(2).max(250))
    .min(1, 'At least one emergency instruction is required')
    .max(15, 'Too many emergency instructions'),

  crisisLine: z
    .string()
    .min(2)
    .max(50)
    .optional()
    .or(z.literal('')),
});

export type UpsertCrisisPlanDto = z.infer<typeof upsertCrisisPlanSchema>;