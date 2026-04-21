import { z } from 'zod';

export const CreateSupportContactDtoSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50).optional(),
  phone: z.string().min(7).max(15).optional(),
  email: z.string().email().optional(),
  isEmergency: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
}).strict();

export const UpdateSupportContactDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  relationship: z.string().min(1).max(50).optional(),
  phone: z.string().min(7).max(15).optional(),
  email: z.string().email().optional(),
  isEmergency: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
}).strict();

export type CreateSupportContactDto = z.infer<typeof CreateSupportContactDtoSchema>;
export type UpdateSupportContactDto = z.infer<typeof UpdateSupportContactDtoSchema>;