import { z } from 'zod';

export const createTreatmentProviderSchema = z.object({
  name: z.string().min(2).max(150),
  zipCode: z.string().min(3).max(20),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  insuranceAccepted: z.array(z.string().min(1).max(100)).max(30).default([]),
  modalities: z.array(z.string().min(1).max(100)).max(30).default([]),
  hasCrisisSupport: z.boolean().optional(),
  phone: z.string().min(3).max(50).optional(),
  website: z.string().url().optional(),
});

export type CreateTreatmentProviderDto = z.infer<typeof createTreatmentProviderSchema>;