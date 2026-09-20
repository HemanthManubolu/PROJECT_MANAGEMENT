import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import activityReducer from '../features/activity/activitySlice';
import notificationReducer from '../features/notifications/notificationSlice';
export const store = configureStore({ reducer: { auth: authReducer, activity: activityReducer, notifications: notificationReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
