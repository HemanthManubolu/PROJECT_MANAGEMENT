import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Activity } from '../../types/activity';
const activitySlice = createSlice({ name: 'activity', initialState: [] as Activity[], reducers: { setActivities: (_state, action: PayloadAction<Activity[]>) => action.payload, receiveActivity: (state, action: PayloadAction<Activity>) => state.some((activity) => activity.id === action.payload.id) ? state : [action.payload, ...state].slice(0, 100) } });
export const { setActivities, receiveActivity } = activitySlice.actions; export default activitySlice.reducer;
