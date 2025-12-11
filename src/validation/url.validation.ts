import { z } from 'zod';
export const urlSchema = z.object({
  originalUrl: z.string().url('URL tidak valid'),

  shortCode: z
    .string()
    .min(3, 'shortcode minimal 3 karakter')
    .max(20, 'shortcode maksimal 20 karakter'),

  // expirationDate: z.string().datetime().optional(),
  expirationDate: z
    .string()
    .datetime()
    .min(1, 'Harus diisi!')
    .refine((val) => {
      const exp = new Date(val);
      const now = new Date();
      const min = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      return exp >= min;
    }, 'Expired date minimal 3 jam dari sekarang'),
});
