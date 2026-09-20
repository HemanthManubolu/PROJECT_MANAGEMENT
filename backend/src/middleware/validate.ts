import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/api-error.js';

export const validate = (schemas: { body?: z.ZodType; params?: z.ZodType; query?: z.ZodType }) => (request: Request, _response: Response, next: NextFunction): void => {
  const result = z.object({ body: schemas.body ?? z.any(), params: schemas.params ?? z.any(), query: schemas.query ?? z.any() }).safeParse({ body: request.body, params: request.params, query: request.query });
  if (!result.success) return next(new ApiError(400, 'VALIDATION_ERROR', result.error.issues.map((issue) => issue.message).join(', ')));
  if (schemas.body) request.body = result.data.body;
  if (schemas.params) request.params = result.data.params as Request['params'];
  if (schemas.query) request.query = result.data.query as Request['query'];
  next();
};
