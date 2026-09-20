import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const projectInclude = { client: true, createdBy: { select: { id: true, name: true, email: true, role: true } }, projectManager: { select: { id: true, name: true, email: true, role: true } }, _count: { select: { tasks: true } } } satisfies Prisma.ProjectInclude;
export const projectRepository = {
  findAccessible(id: string, user: { id: string; role: Role }) {
    return prisma.project.findFirst({ where: { id, ...(user.role === 'ADMIN' ? {} : { projectManagerId: user.id }) }, include: projectInclude });
  },
  listAccessible(user: { id: string; role: Role }) {
    return prisma.project.findMany({ where: user.role === 'ADMIN' ? {} : { projectManagerId: user.id }, include: projectInclude, orderBy: { updatedAt: 'desc' } });
  },
  create(data: Prisma.ProjectCreateInput) { return prisma.project.create({ data, include: projectInclude }); },
  update(id: string, data: Prisma.ProjectUpdateInput) { return prisma.project.update({ where: { id }, data, include: projectInclude }); },
  remove(id: string) { return prisma.project.delete({ where: { id } }); }
};
