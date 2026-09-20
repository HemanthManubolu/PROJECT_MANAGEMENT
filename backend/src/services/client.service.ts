import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
export const clientService = {
  list: () => prisma.client.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { projects: true } } } }),
  async get(id: string) { const client = await prisma.client.findUnique({ where: { id }, include: { projects: true } }); if (!client) throw new ApiError(404, 'CLIENT_NOT_FOUND', 'Client not found'); return client; },
  create: (data: { name: string; email?: string; phone?: string; company?: string }) => prisma.client.create({ data }),
  async update(id: string, data: { name?: string; email?: string; phone?: string; company?: string }) { const existing = await prisma.client.findUnique({ where: { id } }); if (!existing) throw new ApiError(404, 'CLIENT_NOT_FOUND', 'Client not found'); return prisma.client.update({ where: { id }, data }); },
  async remove(id: string) { const existing = await prisma.client.findUnique({ where: { id } }); if (!existing) throw new ApiError(404, 'CLIENT_NOT_FOUND', 'Client not found'); return prisma.client.delete({ where: { id } }); }
};
