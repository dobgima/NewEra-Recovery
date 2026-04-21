import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(2).max(1000).optional(),
  url: z.string().url().optional(),
  type: z.enum(['ARTICLE', 'VIDEO', 'WORKSHEET', 'AUDIO', 'GUIDE']),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  isFeatured: z.boolean().optional(),
});

export type CreateResourceDto = z.infer<typeof createResourceSchema>;