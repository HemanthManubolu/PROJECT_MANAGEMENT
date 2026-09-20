import { Prisma, Role, TaskStatus, type Priority } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { taskInclude, taskRepository } from '../repositories/task.repository.js';
import { ApiError } from '../utils/api-error.js';
import { publishActivity, publishNotification } from '../websocket/socket.js';
import type { CurrentUser } from './access.service.js';
import { requireProjectAccess, requireTaskAccess } from './access.service.js';

type TaskInput = { title: string; description?: string; assignedDeveloperId?: string | null; status?: TaskStatus; priority?: Priority; dueDate?: string | null };
const developerGuard = async (developerId: string | null | undefined): Promise<void> => { if (!developerId) return; const developer = await prisma.user.findUnique({ where: { id: developerId } }); if (!developer || developer.role !== Role.DEVELOPER) throw new ApiError(400, 'INVALID_ASSIGNEE', 'Tasks can only be assigned to a developer'); };
const dateValue = (value: string | null | undefined): Date | null | undefined => value === undefined ? undefined : value === null ? null : new Date(value);

export const taskService = {
  async list(user: CurrentUser, filters: { status?: TaskStatus; priority?: Priority; dueFrom?: string; dueTo?: string; projectId?: string }) {
    const dueDate: Prisma.DateTimeNullableFilter = {};
    if (filters.dueFrom) dueDate.gte = new Date(filters.dueFrom);
    if (filters.dueTo) { const end = new Date(filters.dueTo); end.setUTCHours(23, 59, 59, 999); dueDate.lte = end; }
    return taskRepository.list({ ...(user.role === Role.ADMIN ? {} : user.role === Role.PROJECT_MANAGER ? { project: { projectManagerId: user.id } } : { assignedDeveloperId: user.id }), ...(filters.projectId ? { projectId: filters.projectId } : {}), ...(filters.status ? { status: filters.status } : {}), ...(filters.priority ? { priority: filters.priority } : {}), ...(Object.keys(dueDate).length ? { dueDate } : {}) });
  },
  get: (user: CurrentUser, id: string) => requireTaskAccess(user, id),
  async create(user: CurrentUser, projectId: string, input: TaskInput) {
    await requireProjectAccess(user, projectId); await developerGuard(input.assignedDeveloperId);
    const created = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({ data: { projectId, title: input.title, description: input.description, assignedDeveloperId: input.assignedDeveloperId, status: input.status, priority: input.priority, dueDate: dateValue(input.dueDate), isOverdue: input.dueDate ? new Date(input.dueDate) < new Date() && input.status !== TaskStatus.DONE : false }, include: taskInclude });
      const notification = task.assignedDeveloperId ? await tx.notification.create({ data: { recipientId: task.assignedDeveloperId, projectId, taskId: task.id, type: 'TASK_ASSIGNED', message: `You were assigned “${task.title}”.` } }) : null;
      return { task, notification };
    });
    if (created.notification) await publishNotification(created.notification);
    return created.task;
  },
  async update(user: CurrentUser, id: string, input: Omit<TaskInput, 'status'>) {
    const current = await requireTaskAccess(user, id); if (user.role === Role.DEVELOPER) throw new ApiError(403, 'FORBIDDEN', 'Developers may only update status');
    await developerGuard(input.assignedDeveloperId);
    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({ where: { id }, data: { ...input, dueDate: dateValue(input.dueDate) }, include: taskInclude });
      const notification = input.assignedDeveloperId && input.assignedDeveloperId !== current.assignedDeveloperId ? await tx.notification.create({ data: { recipientId: input.assignedDeveloperId, projectId: task.projectId, taskId: task.id, type: 'TASK_ASSIGNED', message: `You were assigned “${task.title}”.` } }) : null;
      return { task, notification };
    });
    if (updated.notification) await publishNotification(updated.notification);
    return updated.task;
  },
  async updateStatus(user: CurrentUser, id: string, newStatus: TaskStatus) {
    const current = await requireTaskAccess(user, id);
    if (current.status === newStatus) return current;
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({ where: { id }, data: { status: newStatus, isOverdue: current.dueDate ? current.dueDate < new Date() && newStatus !== TaskStatus.DONE : false }, include: taskInclude });
      const activity = await tx.activityLog.create({ data: { projectId: task.projectId, taskId: task.id, userId: user.id, action: 'TASK_STATUS_CHANGED', oldStatus: current.status, newStatus }, include: { user: { select: { id: true, name: true, email: true } }, task: { select: { id: true, title: true, assignedDeveloperId: true } }, project: { select: { id: true, name: true } } } });
      const notification = newStatus === TaskStatus.IN_REVIEW && user.role === Role.DEVELOPER ? await tx.notification.create({ data: { recipientId: task.project.projectManagerId, projectId: task.projectId, taskId: task.id, type: 'TASK_IN_REVIEW', message: `${user.name} moved “${task.title}” to review.` } }) : null;
      return { task, activity, notification };
    });
    await publishActivity(result.activity);
    if (result.notification) await publishNotification(result.notification);
    return result.task;
  },
  async remove(user: CurrentUser, id: string) { const task = await requireTaskAccess(user, id); if (user.role === Role.DEVELOPER) throw new ApiError(403, 'FORBIDDEN', 'Developers cannot delete tasks'); await prisma.task.delete({ where: { id } }); return task; }
};
