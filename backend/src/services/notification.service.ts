import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import type { CurrentUser } from './access.service.js';
export const notificationService = {
  list: (user: CurrentUser) => prisma.notification.findMany({ where: { recipientId: user.id }, orderBy: { createdAt: 'desc' }, take: 30, include: { task: { select: { id: true, title: true } }, project: { select: { id: true, name: true } } } }),
  unreadCount: async (userId: string) => ({ count: await prisma.notification.count({ where: { recipientId: userId, isRead: false } }) }),
  async markRead(user: CurrentUser, id: string) { const notification = await prisma.notification.findFirst({ where: { id, recipientId: user.id } }); if (!notification) throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found'); return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } }); },
  async markAllRead(user: CurrentUser) { await prisma.notification.updateMany({ where: { recipientId: user.id, isRead: false }, data: { isRead: true, readAt: new Date() } }); return this.unreadCount(user.id); }
};
