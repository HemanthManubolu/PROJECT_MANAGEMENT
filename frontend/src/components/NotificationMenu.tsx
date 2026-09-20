import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { api } from '../services/api';
import type { Notification } from '../types/notification';
import { markNotificationRead, setNotifications, setUnreadCount } from '../features/notifications/notificationSlice';
import { dateTime } from '../utils/format';
export const NotificationMenu = (): React.JSX.Element => {
  const [open, setOpen] = useState(false); const { items, unreadCount } = useAppSelector((state) => state.notifications); const dispatch = useAppDispatch();
  useEffect(() => { void Promise.all([api<Notification[]>('/notifications'), api<{ count: number }>('/notifications/unread-count')]).then(([notifications, unread]) => { dispatch(setNotifications(notifications)); dispatch(setUnreadCount(unread.count)); }).catch(() => undefined); }, [dispatch]);
  const read = async (id: string): Promise<void> => { await api<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }); dispatch(markNotificationRead(id)); };
  const readAll = async (): Promise<void> => { const result = await api<{ count: number }>('/notifications/read-all', { method: 'PATCH' }); dispatch(setNotifications(items.map((item) => ({ ...item, isRead: true })))); dispatch(setUnreadCount(result.count)); };
  return <div className="relative"><button aria-label="Notifications" className="icon-button relative" onClick={() => setOpen((value) => !value)}><Bell size={18}/>{unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>{open && <div className="notification-panel"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><strong className="text-sm">Notifications</strong><button className="text-xs text-blue-600" onClick={() => void readAll()}>Mark all read</button></div><div className="max-h-80 overflow-auto">{items.length === 0 ? <p className="empty">You’re all caught up.</p> : items.map((item) => <button className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${item.isRead ? '' : 'bg-blue-50/50'}`} key={item.id} onClick={() => void read(item.id)}><p className="text-sm text-slate-700">{item.message}</p><p className="mt-1 text-xs text-slate-400">{dateTime(item.createdAt)}</p></button>)}</div></div>}</div>;
};
