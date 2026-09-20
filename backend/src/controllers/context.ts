import type { Request } from 'express';
import { ApiError } from '../utils/api-error.js';
import type { CurrentUser } from '../services/access.service.js';
export const currentUser = (request: Request): CurrentUser => { if (!request.user) throw new ApiError(401, 'AUTH_REQUIRED', 'Authentication is required'); return request.user; };
