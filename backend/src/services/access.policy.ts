import type { Role } from '@prisma/client';
export type PolicyUser = { id: string; role: Role };
export const canAccessProject = (user: PolicyUser, projectManagerId: string): boolean => user.role === 'ADMIN' || (user.role === 'PROJECT_MANAGER' && user.id === projectManagerId);
export const canAccessTask = (user: PolicyUser, task: { assignedDeveloperId: string | null; projectManagerId: string }): boolean => user.role === 'ADMIN' || (user.role === 'PROJECT_MANAGER' && task.projectManagerId === user.id) || (user.role === 'DEVELOPER' && task.assignedDeveloperId === user.id);
export const canManageTask = (user: PolicyUser, projectManagerId: string): boolean => user.role === 'ADMIN' || (user.role === 'PROJECT_MANAGER' && projectManagerId === user.id);
