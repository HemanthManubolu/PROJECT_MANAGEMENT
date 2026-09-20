import type { Project } from './project';
import type { User } from './user';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface Task { id: string; projectId: string; title: string; description: string | null; assignedDeveloperId: string | null; status: TaskStatus; priority: Priority; dueDate: string | null; isOverdue: boolean; createdAt: string; updatedAt: string; project: Project; assignedDeveloper: Pick<User, 'id' | 'name' | 'email'> | null; }
