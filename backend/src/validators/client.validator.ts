import { z } from 'zod';
export const clientSchema = z.object({ name: z.string().trim().min(2).max(150), email: z.string().trim().email().optional().or(z.literal('')).transform((value) => value || undefined), phone: z.string().trim().max(50).optional(), company: z.string().trim().max(150).optional() });
