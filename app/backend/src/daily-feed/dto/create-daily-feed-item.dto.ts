import { z } from 'zod';

export const createDailyFeedItemSchema = z.object({
  title: z.string().min(2).max(150),
  body: z.string().min(5).max(5000),
  category: z.string().min(2).max(50),
  dayKey: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateDailyFeedItemDto = z.infer<typeof createDailyFeedItemSchema>;