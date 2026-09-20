import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/auth.js';

const publicUser = (user: { id: string; name: string; email: string; role: Role; createdAt?: Date }) => ({ id: user.id, name: user.name, email: user.email, role: user.role, ...(user.createdAt ? { createdAt: user.createdAt } : {}) });
export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    const user = await prisma.user.create({ data: { name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12), role: Role.DEVELOPER } });
    return { user: publicUser(user), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) };
  },
  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    return { user: publicUser(user), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) };
  },
  async refresh(refreshToken: string) {
    let token; try { token = verifyRefreshToken(refreshToken); } catch { throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired'); }
    const user = await prisma.user.findUnique({ where: { id: token.sub } });
    if (!user || token.version !== user.refreshTokenVersion) throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is no longer valid');
    return { user: publicUser(user), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) };
  },
  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try { const token = verifyRefreshToken(refreshToken); await prisma.user.update({ where: { id: token.sub }, data: { refreshTokenVersion: { increment: 1 } } }); } catch { /* Cookie is cleared even for a stale token. */ }
  },
  async me(userId: string) { const user = await prisma.user.findUnique({ where: { id: userId } }); if (!user) throw new ApiError(401, 'AUTH_REQUIRED', 'Account no longer exists'); return publicUser(user); }
};
