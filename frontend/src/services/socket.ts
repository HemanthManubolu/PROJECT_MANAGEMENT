import { io, type Socket } from 'socket.io-client';
import type { Activity } from '../types/activity';
import type { Notification } from '../types/notification';
import { backendOrigin } from './api';
let socket: Socket | null = null;
export interface RealtimeHandlers { onActivity: (activity: Activity) => void; onCatchup: (activities: Activity[]) => void; onNotification: (notification: Notification) => void; onUnreadCount: (payload: { count: number }) => void; onPresence: (payload: { count: number }) => void; }
export const connectSocket = (token: string, handlers: RealtimeHandlers): (() => void) => {
  socket?.disconnect();
  socket = io(backendOrigin, { auth: { token }, withCredentials: true, reconnection: true });
  socket.on('activity:created', handlers.onActivity); socket.on('activity:catchup', handlers.onCatchup); socket.on('notification:created', handlers.onNotification); socket.on('notification:unread-count', handlers.onUnreadCount); socket.on('presence:count', handlers.onPresence);
  return () => { socket?.disconnect(); socket = null; };
};
