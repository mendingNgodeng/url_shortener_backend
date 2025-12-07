import { z } from 'zod';
export const urlSchema = z.object({
  originalUrl: z.string().url('URL tidak valid'),

  shortCode: z
    .string()
    .min(3, 'shortcode minimal 3 karakter')
    .max(20, 'shortcode maksimal 20 karakter'),

  // expirationDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().min(1, 'Harus diisi!'),
});
