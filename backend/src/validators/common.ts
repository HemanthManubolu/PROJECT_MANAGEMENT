import { z } from 'zod';
export const idParams = z.object({ id: z.string().uuid() });
export const projectParams = z.object({ projectId: z.string().uuid() });
export const taskStatus = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
export const priority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const optionalDate = z.string().date().optional();
