import { api } from './api';
import type { Activity } from '../types/activity';
import type { Priority, Task, TaskStatus } from '../types/task';
import type { Role } from '../types/user';
export interface DashboardData { role: Role; totalProjects?: number; totalTasks: number; tasksByStatus: Record<TaskStatus, number>; tasksByPriority: Record<Priority, number>; overdueTaskCount: number; upcomingDueDates: Array<Pick<Task, 'status' | 'priority' | 'dueDate' | 'projectId' | 'isOverdue'>>; assignedTasks?: Array<Pick<Task, 'status' | 'priority' | 'dueDate' | 'projectId' | 'isOverdue'>>; activeUsersOnline?: number; activity: Activity[]; }
export const getDashboard = (): Promise<DashboardData> => api<DashboardData>('/dashboard');
