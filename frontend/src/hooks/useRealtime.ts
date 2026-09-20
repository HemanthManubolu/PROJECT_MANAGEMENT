import { useEffect } from 'react';
import { connectSocket } from '../services/socket';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { receiveActivity, setActivities } from '../features/activity/activitySlice';
import { receiveNotification, setUnreadCount } from '../features/notifications/notificationSlice';
export const useRealtime = (onPresence: (count: number) => void): void => {
  const token = useAppSelector((state) => state.auth.accessToken); const dispatch = useAppDispatch();
  useEffect(() => token ? connectSocket(token, { onActivity: (activity) => dispatch(receiveActivity(activity)), onCatchup: (activities) => dispatch(setActivities(activities)), onNotification: (notification) => dispatch(receiveNotification(notification)), onUnreadCount: ({ count }) => dispatch(setUnreadCount(count)), onPresence: ({ count }) => onPresence(count) }) : undefined, [dispatch, onPresence, token]);
};
