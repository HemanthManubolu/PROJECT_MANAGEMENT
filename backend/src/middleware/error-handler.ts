import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/api-error.js';

export const notFound: RequestHandler = (_request, _response, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found'));
export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ApiError) return response.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return response.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'A record with that value already exists' } });
  console.error('Unhandled application error');
  return response.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};
