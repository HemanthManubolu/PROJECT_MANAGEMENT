import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
export const taskInclude = { project: { include: { client: true, createdBy: { select: { id: true, name: true, email: true }, }, projectManager: { select: { id: true, name: true, email: true, role: true } } } }, assignedDeveloper: { select: { id: true, name: true, email: true } } } satisfies Prisma.TaskInclude;
export const taskRepository = {
  findById(id: string) { return prisma.task.findUnique({ where: { id }, include: taskInclude }); },
  list(where: Prisma.TaskWhereInput) { return prisma.task.findMany({ where, include: taskInclude, orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }] }); }
};
