import type { TaskStatus } from './task';
import type { User } from './user';
export interface Activity { id: string; projectId: string; taskId: string; userId: string; action: string; oldStatus: TaskStatus | null; newStatus: TaskStatus | null; createdAt: string; user: Pick<User, 'id' | 'name' | 'email'>; task: { id: string; title: string; assignedDeveloperId: string | null }; project: { id: string; name: string }; }
