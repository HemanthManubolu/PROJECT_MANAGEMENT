import type { Role } from '@prisma/client';
import { ApiError } from '../utils/api-error.js';
import { projectRepository } from '../repositories/project.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { canAccessProject, canAccessTask } from './access.policy.js';

export type CurrentUser = { id: string; role: Role; name: string };
export async function requireProjectAccess(user: CurrentUser, projectId: string) {
  if (user.role === 'DEVELOPER') throw new ApiError(403, 'FORBIDDEN', 'Developers cannot access project data');
  const project = await projectRepository.findAccessible(projectId, user);
  if (!project || !canAccessProject(user, project.projectManagerId)) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  return project;
}
export async function requireTaskAccess(user: CurrentUser, taskId: string) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
  if (canAccessTask(user, { assignedDeveloperId: task.assignedDeveloperId, projectManagerId: task.project.projectManagerId })) return task;
  throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
}
