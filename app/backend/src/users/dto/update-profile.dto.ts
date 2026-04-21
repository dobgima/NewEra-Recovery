import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  zipCode: z.string().min(5).max(10).optional(),
  phone: z.string().min(7).optional(),
  avatarUrl: z.string().url().optional(),
  insuranceProvider: z.string().min(1).optional(),
  sobrietyDate: z.string().datetime().optional(),
  timezone: z.string().min(1).max(50).optional(),
  notificationPrefs: z.record(z.any()).optional(),
  reminderPrefs: z.record(z.any()).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  primaryModality: z.enum(['AA', 'NA', 'SMART', 'DHARMA', 'THERAPY', 'MEDICATION_ASSISTED', 'FAITH_BASED', 'OTHER']).optional(),
  secondaryModality: z.enum(['AA', 'NA', 'SMART', 'DHARMA', 'THERAPY', 'MEDICATION_ASSISTED', 'FAITH_BASED', 'OTHER']).optional(),
  wantsReminders: z.boolean().optional(),
  wantsPeerSupport: z.boolean().optional(),
  dailyCheckinHour: z.number().int().min(0).max(23).optional(),
}).strict();

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;