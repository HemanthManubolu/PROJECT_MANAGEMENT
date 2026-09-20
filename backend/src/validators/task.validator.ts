import { z } from 'zod';
import { optionalDate, priority, taskStatus } from './common.js';
export const createTaskSchema = z.object({ title: z.string().trim().min(2).max(250), description: z.string().trim().max(5000).optional(), assignedDeveloperId: z.string().uuid().nullable().optional(), status: taskStatus.optional(), priority: priority.optional(), dueDate: optionalDate.nullable() });
export const updateTaskSchema = createTaskSchema.omit({ status: true }).partial().refine((data) => Object.keys(data).length > 0, 'At least one field is required');
export const updateStatusSchema = z.object({ status: taskStatus });
export const taskQuerySchema = z.object({ status: taskStatus.optional(), priority: priority.optional(), dueFrom: optionalDate, dueTo: optionalDate, projectId: z.string().uuid().optional() }).refine((query) => !query.dueFrom || !query.dueTo || query.dueFrom <= query.dueTo, 'dueFrom must be before dueTo');
