import { prisma } from '../config/prisma.js';
import { projectRepository } from '../repositories/project.repository.js';
import { ApiError } from '../utils/api-error.js';
import type { CurrentUser } from './access.service.js';
import { requireProjectAccess } from './access.service.js';
export const projectService = {
  list: (user: CurrentUser) => projectRepository.listAccessible(user),
  get: (user: CurrentUser, id: string) => requireProjectAccess(user, id),
  async create(user: CurrentUser, data: { name: string; description?: string; clientId: string; projectManagerId?: string }) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } }); if (!client) throw new ApiError(404, 'CLIENT_NOT_FOUND', 'Client not found');
    const projectManagerId = user.role === 'ADMIN' ? data.projectManagerId : user.id;
    if (!projectManagerId) throw new ApiError(400, 'PROJECT_MANAGER_REQUIRED', 'An assigned project manager is required');
    await assertProjectManager(projectManagerId);
    return projectRepository.create({ name: data.name, description: data.description, client: { connect: { id: data.clientId } }, createdBy: { connect: { id: user.id } }, projectManager: { connect: { id: projectManagerId } } });
  },
  async update(user: CurrentUser, id: string, data: { name?: string; description?: string; clientId?: string; projectManagerId?: string }) {
    const existing = await requireProjectAccess(user, id);
    const { clientId, projectManagerId, ...projectData } = data;
    if (clientId && !await prisma.client.findUnique({ where: { id: clientId } })) throw new ApiError(404, 'CLIENT_NOT_FOUND', 'Client not found');
    if (projectManagerId && user.role !== 'ADMIN' && projectManagerId !== existing.projectManagerId) throw new ApiError(403, 'FORBIDDEN', 'Only an administrator can reassign a project manager');
    if (projectManagerId) await assertProjectManager(projectManagerId);
    return projectRepository.update(id, { ...projectData, ...(clientId ? { client: { connect: { id: clientId } } } : {}), ...(projectManagerId ? { projectManager: { connect: { id: projectManagerId } } } : {}) });
  },
  async remove(user: CurrentUser, id: string) { await requireProjectAccess(user, id); return projectRepository.remove(id); }
};

async function assertProjectManager(userId: string): Promise<void> {
  const manager = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!manager || manager.role !== 'PROJECT_MANAGER') throw new ApiError(400, 'INVALID_PROJECT_MANAGER', 'The assigned user must be a project manager');
}
