export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
export interface User { id: string; name: string; email: string; role: Role; createdAt?: string; }
