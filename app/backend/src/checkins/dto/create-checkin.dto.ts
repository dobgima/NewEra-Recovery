import { z } from 'zod';
import { MoodLevel } from '@prisma/client';

export const createCheckInSchema = z.object({
  mood: z.nativeEnum(MoodLevel),
  cravingsLevel: z.number().int().min(0).max(10),
  triggers: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().trim().max(2000).optional(),
  feltUnsafe: z.boolean().default(false),
  needsSupport: z.boolean().default(false),
});

export type CreateCheckInDto = z.infer<typeof createCheckInSchema>;