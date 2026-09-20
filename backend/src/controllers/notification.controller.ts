import type { RequestHandler } from 'express';
import { notificationService } from '../services/notification.service.js';
import { publishUnreadCount } from '../websocket/socket.js';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
export const listNotifications: RequestHandler = async (request, response) => ok(response, await notificationService.list(currentUser(request)));
export const unreadCount: RequestHandler = async (request, response) => ok(response, await notificationService.unreadCount(currentUser(request).id));
export const markRead: RequestHandler = async (request, response) => { const user = currentUser(request); const notification = await notificationService.markRead(user, String(request.params.id)); await publishUnreadCount(user.id); ok(response, notification); };
export const markAllRead: RequestHandler = async (request, response) => { const user = currentUser(request); const count = await notificationService.markAllRead(user); await publishUnreadCount(user.id); ok(response, count); };

