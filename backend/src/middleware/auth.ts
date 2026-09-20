import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken } from '../utils/auth.js';

export function authenticate(request: Request, _response: Response, next: NextFunction): void {
  const token = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : undefined;
  if (!token) return next(new ApiError(401, 'AUTH_REQUIRED', 'Authentication is required'));
  try { const payload = verifyAccessToken(token); request.user = { id: payload.sub, role: payload.role, name: payload.name }; next(); }
  catch { next(new ApiError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired')); }
}
export const requireRoles = (...roles: Role[]) => (request: Request, _response: Response, next: NextFunction): void => {
  if (!request.user || !roles.includes(request.user.role)) return next(new ApiError(403, 'FORBIDDEN', 'You are not authorized to perform this action'));
  next();
};
