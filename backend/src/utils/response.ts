import type { Response } from 'express';
export const ok = <T>(response: Response, data: T, status = 200): Response => response.status(status).json({ success: true, data });
