import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user';
import { authApi, setAccessToken } from '../../services/api';
interface AuthState { user: User | null; accessToken: string | null; initialized: boolean; loading: boolean; }
const initialState: AuthState = { user: null, accessToken: null, initialized: false, loading: false };
export const restoreSession = createAsyncThunk('auth/restore', async () => authApi.refresh());
export const authSlice = createSlice({ name: 'auth', initialState, reducers: { setSession: (state, action: PayloadAction<{ user: User; accessToken: string }>) => { state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.initialized = true; setAccessToken(action.payload.accessToken); }, clearSession: (state) => { state.user = null; state.accessToken = null; state.initialized = true; setAccessToken(null); } }, extraReducers: (builder) => { builder.addCase(restoreSession.pending, (state) => { state.loading = true; }).addCase(restoreSession.fulfilled, (state, action) => { state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.initialized = true; state.loading = false; setAccessToken(action.payload.accessToken); }).addCase(restoreSession.rejected, (state) => { state.initialized = true; state.loading = false; setAccessToken(null); }); } });
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
