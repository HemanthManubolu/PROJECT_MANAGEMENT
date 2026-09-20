export interface ApiFailure { success: false; error: { code: string; message: string }; }
export interface ApiSuccess<T> { success: true; data: T; }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export class ApiClientError extends Error { public constructor(public readonly code: string, message: string, public readonly status: number) { super(message); } }
