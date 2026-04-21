import { z } from 'zod';

export const createPeerRequestSchema = z.object({
  recipientId: z.string().uuid(),
  message: z.string().min(2).max(500).optional(),
});

export type CreatePeerRequestDto = z.infer<typeof createPeerRequestSchema>;