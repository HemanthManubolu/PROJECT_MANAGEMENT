import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types/notification';
interface NotificationState { items: Notification[]; unreadCount: number; }
const initialState: NotificationState = { items: [], unreadCount: 0 };
const notificationSlice = createSlice({ name: 'notifications', initialState, reducers: { setNotifications: (state, action: PayloadAction<Notification[]>) => { state.items = action.payload; state.unreadCount = action.payload.filter((item) => !item.isRead).length; }, receiveNotification: (state, action: PayloadAction<Notification>) => { if (!state.items.some((item) => item.id === action.payload.id)) state.items.unshift(action.payload); }, setUnreadCount: (state, action: PayloadAction<number>) => { state.unreadCount = action.payload; }, markNotificationRead: (state, action: PayloadAction<string>) => { const item = state.items.find((notification) => notification.id === action.payload); if (item) item.isRead = true; } } });
export const { setNotifications, receiveNotification, setUnreadCount, markNotificationRead } = notificationSlice.actions; export default notificationSlice.reducer;
