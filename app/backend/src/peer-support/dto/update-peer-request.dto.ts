import { z } from 'zod';

export const updatePeerRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'CANCELLED']),
});

export type UpdatePeerRequestDto = z.infer<typeof updatePeerRequestSchema>;