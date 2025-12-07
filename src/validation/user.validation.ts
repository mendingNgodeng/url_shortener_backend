import { z } from 'zod';

export const updateProfile = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .optional(),

  email: z
    .string()
    .email('Format email tidak valid')
    .min(1, 'Email Tidak boleh koson')
    .optional(),
});

export const updatePass = z.object({
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
