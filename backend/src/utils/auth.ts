import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
export interface TokenPayload { sub: string; role: Role; name: string; version?: number; }
export const signAccessToken = (user: { id: string; role: Role; name: string }): string => jwt.sign({ role: user.role, name: user.name }, env.JWT_ACCESS_SECRET, { subject: user.id, expiresIn: '15m' });
export const signRefreshToken = (user: { id: string; role: Role; name: string; refreshTokenVersion: number }): string => jwt.sign({ role: user.role, name: user.name, version: user.refreshTokenVersion }, env.JWT_REFRESH_SECRET, { subject: user.id, expiresIn: '7d' });
export const verifyAccessToken = (token: string): TokenPayload => jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
export const verifyRefreshToken = (token: string): TokenPayload => jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
export const refreshCookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 };
