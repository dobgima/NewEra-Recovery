import { z } from 'zod';
import { MoodLevel } from '@prisma/client';

export const assessRiskSchema = z.object({
  mood: z.nativeEnum(MoodLevel),
  cravingsLevel: z.number().min(0).max(10),
  triggers: z.array(z.string()),
  feltUnsafe: z.boolean(),
  needsSupport: z.boolean(),
  notes: z.string().trim().max(2000).optional(),
});

export type AssessRiskSchemaDto = z.infer<typeof assessRiskSchema>;