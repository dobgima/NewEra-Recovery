import { z } from 'zod';
import { MoodLevel } from '@prisma/client';

export const assessRiskSchema = z.object({
  mood: z.nativeEnum(MoodLevel),
  cravingsLevel: z.number().int().min(0).max(10),
  triggers: z.array(z.string().trim().min(1)).default([]),
  feltUnsafe: z.boolean().default(false),
  needsSupport: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional(),
});

export type AssessRiskDto = z.infer<typeof assessRiskSchema>;