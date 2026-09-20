import type { ApiResponse } from '../types/api';
import { ApiClientError } from '../types/api';
import type { User } from '../types/user';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
let accessToken: string | null = null;
let refreshPromise: Promise<{ user: User; accessToken: string }> | null = null;
let onRefresh: ((session: { user: User; accessToken: string }) => void) | undefined;
export const setAccessToken = (token: string | null): void => { accessToken = token; };
export const setRefreshListener = (listener: (session: { user: User; accessToken: string }) => void): void => { onRefresh = listener; };

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json() as ApiResponse<T>;
  if (!payload.success) throw new ApiClientError(payload.error.code, payload.error.message, response.status);
  return payload.data;
}
async function refreshSession(): Promise<{ user: User; accessToken: string }> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${baseUrl}/auth/refresh`, { method: 'POST', credentials: 'include' }).then((response) => parse<{ user: User; accessToken: string }>(response)).then((session) => { setAccessToken(session.accessToken); onRefresh?.(session); return session; }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers); headers.set('Content-Type', 'application/json'); if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) { try { await refreshSession(); return api<T>(path, init, false); } catch { setAccessToken(null); } }
  if (response.status === 204) return undefined as T;
  return parse<T>(response);
}
export const authApi = { login: (email: string, password: string) => api<{ user: User; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), register: (name: string, email: string, password: string) => api<{ user: User; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }), refresh: refreshSession, logout: () => api<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }) };
