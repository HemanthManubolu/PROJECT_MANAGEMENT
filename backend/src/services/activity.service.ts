import { prisma } from '../config/prisma.js';
import type { CurrentUser } from './access.service.js';
import { requireProjectAccess } from './access.service.js';

const include = { user: { select: { id: true, name: true, email: true } }, task: { select: { id: true, title: true, assignedDeveloperId: true } }, project: { select: { id: true, name: true } } } as const;
const whereFor = (user: CurrentUser) => user.role === 'ADMIN' ? {} : user.role === 'PROJECT_MANAGER' ? { project: { projectManagerId: user.id } } : { task: { assignedDeveloperId: user.id } };
export const activityService = {
  listForUser: (user: CurrentUser, take = 50) => prisma.activityLog.findMany({ where: whereFor(user), include, orderBy: { createdAt: 'desc' }, take }),
  listForProject: async (user: CurrentUser, projectId: string) => { await requireProjectAccess(user, projectId); return prisma.activityLog.findMany({ where: { projectId }, include, orderBy: { createdAt: 'desc' }, take: 100 }); },
  missed: (user: CurrentUser) => prisma.activityLog.findMany({ where: whereFor(user), include, orderBy: { createdAt: 'desc' }, take: 20 })
};
