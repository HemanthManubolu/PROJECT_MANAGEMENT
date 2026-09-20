import type { RequestHandler } from 'express';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
import { userService } from '../services/user.service.js';
export const listUsers: RequestHandler = async (_request, response) => ok(response, await userService.list());
export const listDevelopers: RequestHandler = async (_request, response) => ok(response, await userService.developers());
export const getUser: RequestHandler = async (request, response) => ok(response, await userService.get(String(request.params.id)));
export const createUser: RequestHandler = async (request, response) => ok(response, await userService.create(request.body), 201);
export const updateUser: RequestHandler = async (request, response) => ok(response, await userService.update(String(request.params.id), request.body));
export const deleteUser: RequestHandler = async (request, response) => { await userService.remove(currentUser(request).id, String(request.params.id)); response.status(204).send(); };

