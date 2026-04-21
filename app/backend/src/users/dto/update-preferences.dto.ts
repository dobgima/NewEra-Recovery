import { z } from 'zod';
import { RecoveryModality } from '@prisma/client';

export const updatePreferencesSchema = z.object({
  primaryModality: z.nativeEnum(RecoveryModality).optional(),
  secondaryModality: z.nativeEnum(RecoveryModality).optional(),
  wantsReminders: z.boolean().optional(),
  wantsPeerSupport: z.boolean().optional(),
  dailyCheckinHour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().min(1).optional()
});

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;