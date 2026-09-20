import { z } from 'zod';
export const projectSchema = z.object({ name: z.string().trim().min(2).max(150), description: z.string().trim().max(5000).optional(), clientId: z.string().uuid(), projectManagerId: z.string().uuid().optional() });
export const projectUpdateSchema = projectSchema.partial().refine((data) => Object.keys(data).length > 0, 'At least one field is required');
