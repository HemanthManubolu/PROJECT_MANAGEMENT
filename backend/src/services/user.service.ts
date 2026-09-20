import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';

const publicSelect = { id: true, name: true, email: true, role: true, createdAt: true } as const;
type UserInput = { name: string; email: string; password: string; role: 'PROJECT_MANAGER' | 'DEVELOPER' };
type UserUpdateInput = Partial<UserInput>;

export const userService = {
  list: () => prisma.user.findMany({ select: publicSelect, orderBy: { name: 'asc' } }),
  developers: () => prisma.user.findMany({ where: { role: 'DEVELOPER' }, select: publicSelect, orderBy: { name: 'asc' } }),
  async get(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
  },
  async create(input: UserInput) {
    const email = input.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    return prisma.user.create({ data: { name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12), role: input.role }, select: publicSelect });
  },
  async update(id: string, input: UserUpdateInput) {
    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, _count: { select: { managedProjects: true } } } });
    if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    if (existing.role === 'PROJECT_MANAGER' && input.role === 'DEVELOPER' && existing._count.managedProjects > 0) throw new ApiError(409, 'USER_MANAGES_PROJECTS', 'Reassign this member’s projects before changing their role');
    const email = input.email?.toLowerCase();
    if (email) {
      const matchingUser = await prisma.user.findUnique({ where: { email } });
      if (matchingUser && matchingUser.id !== id) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined;
    // Version bump invalidates existing refresh sessions when credentials or role change.
    const invalidateSessions = Boolean(input.password || input.role);
    return prisma.user.update({ where: { id }, data: { name: input.name, email, role: input.role, passwordHash, ...(invalidateSessions ? { refreshTokenVersion: { increment: 1 } } : {}) }, select: publicSelect });
  },
  async remove(actorId: string, id: string): Promise<void> {
    if (actorId === id) throw new ApiError(400, 'CANNOT_DELETE_SELF', 'You cannot delete your own administrator account');
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, _count: { select: { createdProjects: true, managedProjects: true, activityLogs: true, assignedTasks: true } } } });
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    if (user._count.createdProjects > 0 || user._count.managedProjects > 0 || user._count.activityLogs > 0 || user._count.assignedTasks > 0) throw new ApiError(409, 'USER_HAS_DEPENDENCIES', 'This member has projects, tasks, or activity history and cannot be deleted safely');
    await prisma.user.delete({ where: { id } });
  }
};
