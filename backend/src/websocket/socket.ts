import type { ActivityLog, Notification, Role } from '@prisma/client';
import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { verifyAccessToken } from '../utils/auth.js';
import { activityService } from '../services/activity.service.js';
import type { CurrentUser } from '../services/access.service.js';

type ActivityPayload = { id: string; projectId: string; taskId: string; userId: string; action: string; oldStatus: string | null; newStatus: string | null; createdAt: Date; user: { id: string; name: string; email: string }; task: { id: string; title: string; assignedDeveloperId: string | null }; project: { id: string; name: string } };
type SocketData = { user: CurrentUser };
interface ClientEvents { join_project: (projectId: string, callback: (result: { ok: boolean; code?: string }) => void) => void; }
interface ServerEvents { 'activity:created': (activity: ActivityPayload) => void; 'activity:catchup': (activities: ActivityPayload[]) => void; 'notification:created': (notification: Notification) => void; 'notification:unread-count': (payload: { count: number }) => void; 'presence:count': (payload: { count: number }) => void; }

let io: Server<ClientEvents, ServerEvents, Record<string, never>, SocketData> | undefined;
const presence = new Map<string, Set<string>>();
const usersRoom = (id: string): string => `user:${id}`;
const projectRoom = (id: string): string => `project:${id}`;
const isProjectAccessible = async (user: CurrentUser, projectId: string): Promise<boolean> => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'PROJECT_MANAGER') return Boolean(await prisma.project.findFirst({ where: { id: projectId, projectManagerId: user.id }, select: { id: true } }));
  return false;
};
const broadcastPresence = (): void => { io?.to('admins').emit('presence:count', { count: presence.size }); };

export function initializeSocket(server: HttpServer): Server<ClientEvents, ServerEvents, Record<string, never>, SocketData> {
  io = new Server(server, { cors: { origin: env.CLIENT_ORIGIN, credentials: true } });
  io.use(async (socket, next) => {
    const token = (socket.handshake.auth as { token?: unknown }).token;
    if (typeof token !== 'string') return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, role: true } });
      if (!user) return next(new Error('Authentication required'));
      socket.data.user = user;
      next();
    } catch { next(new Error('Authentication required')); }
  });
  io.on('connection', async (socket) => {
    const user = socket.data.user;
    socket.join(usersRoom(user.id));
    if (user.role === 'ADMIN') socket.join('admins');
    if (user.role === 'PROJECT_MANAGER') {
      const projects = await prisma.project.findMany({ where: { projectManagerId: user.id }, select: { id: true } });
      projects.forEach((project) => socket.join(projectRoom(project.id)));
    }
    const wasOffline = !presence.has(user.id);
    const connections = presence.get(user.id) ?? new Set<string>(); connections.add(socket.id); presence.set(user.id, connections);
    if (wasOffline) broadcastPresence();
    socket.emit('activity:catchup', await activityService.missed(user));
    socket.on('join_project', async (projectId, callback) => {
      if (typeof projectId !== 'string' || !await isProjectAccessible(user, projectId)) return callback({ ok: false, code: 'FORBIDDEN' });
      socket.join(projectRoom(projectId)); callback({ ok: true });
    });
    socket.on('disconnect', () => {
      const active = presence.get(user.id); if (!active) return;
      active.delete(socket.id); if (active.size === 0) { presence.delete(user.id); broadcastPresence(); }
    });
  });
  return io;
}
export async function publishActivity(activity: ActivityPayload): Promise<void> {
  if (!io) return;
  io.to('admins').emit('activity:created', activity);
  io.to(projectRoom(activity.projectId)).emit('activity:created', activity);
  if (activity.task.assignedDeveloperId) io.to(usersRoom(activity.task.assignedDeveloperId)).emit('activity:created', activity);
}
export async function publishNotification(notification: Notification): Promise<void> {
  if (!io) return;
  const count = await prisma.notification.count({ where: { recipientId: notification.recipientId, isRead: false } });
  io.to(usersRoom(notification.recipientId)).emit('notification:created', notification);
  io.to(usersRoom(notification.recipientId)).emit('notification:unread-count', { count });
}
export async function publishUnreadCount(userId: string): Promise<void> { if (io) io.to(usersRoom(userId)).emit('notification:unread-count', { count: await prisma.notification.count({ where: { recipientId: userId, isRead: false } }) }); }
export const onlineUserCount = (): number => presence.size;
