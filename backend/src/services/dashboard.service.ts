import { Role, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { onlineUserCount } from '../websocket/socket.js';
import type { CurrentUser } from './access.service.js';
import { activityService } from './activity.service.js';

export const dashboardService = {
  async get(user: CurrentUser) {
    const scope = user.role === Role.ADMIN ? {} : user.role === Role.PROJECT_MANAGER ? { project: { projectManagerId: user.id } } : { assignedDeveloperId: user.id };
    const [tasks, activity] = await Promise.all([prisma.task.findMany({ where: scope, select: { status: true, priority: true, dueDate: true, isOverdue: true, projectId: true }, orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }], take: user.role === Role.DEVELOPER ? 100 : undefined }), activityService.listForUser(user, 20)]);
    const statuses = Object.fromEntries(Object.values(TaskStatus).map((status) => [status, 0])) as Record<TaskStatus, number>;
    const priorities: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    tasks.forEach((task) => {
  statuses[task.status] = (statuses[task.status] ?? 0) + 1;
  priorities[task.priority] = (priorities[task.priority] ?? 0) + 1;
});
    const week = new Date(); week.setDate(week.getDate() + 7);
    const projectCount = user.role === Role.DEVELOPER ? undefined : await prisma.project.count({ where: user.role === Role.ADMIN ? {} : { projectManagerId: user.id } });
    return { role: user.role, totalProjects: projectCount, totalTasks: tasks.length, tasksByStatus: statuses, tasksByPriority: priorities, overdueTaskCount: tasks.filter((task) => task.isOverdue).length, upcomingDueDates: tasks.filter((task) => task.dueDate && task.dueDate >= new Date() && task.dueDate <= week).slice(0, 10), assignedTasks: user.role === Role.DEVELOPER ? tasks : undefined, activeUsersOnline: user.role === Role.ADMIN ? onlineUserCount() : undefined, activity };
  }
};
