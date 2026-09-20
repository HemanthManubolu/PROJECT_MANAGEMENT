import { z } from 'zod';
const assignableRole = z.enum(['PROJECT_MANAGER', 'DEVELOPER']);
export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(10).max(128),
  role: assignableRole
});
export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(320).optional(),
  password: z.string().min(10).max(128).optional(),
  role: assignableRole.optional()
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required');
