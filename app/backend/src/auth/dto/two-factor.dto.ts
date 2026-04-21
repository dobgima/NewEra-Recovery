import { z } from 'zod';

export const setupTwoFactorSchema = z.object({
  method: z.enum(['email', 'sms']),
});

export type SetupTwoFactorDto = z.infer<typeof setupTwoFactorSchema>;

export const verifyTwoFactorSchema = z.object({
  token: z.string().min(1, 'Session token is required'),
  code: z.string().regex(/^\d{6}$/, 'Code must be a 6-digit number'),
});

export type VerifyTwoFactorDto = z.infer<typeof verifyTwoFactorSchema>;

export const verifyTwoFactorLoginSchema = z.object({
  twoFactorToken: z.string().min(1, 'Two factor token is required'),
  code: z.string().regex(/^\d{6}$/, 'Code must be a 6-digit number'),
});

export type VerifyTwoFactorLoginDto = z.infer<typeof verifyTwoFactorLoginSchema>;

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required for security'),
});

export type DisableTwoFactorDto = z.infer<typeof disableTwoFactorSchema>;
