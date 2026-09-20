import type { RequestHandler } from 'express';
import { taskService } from '../services/task.service.js';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
export const listTasks: RequestHandler = async (request, response) => ok(response, await taskService.list(currentUser(request), request.query));
export const getTask: RequestHandler = async (request, response) => ok(response, await taskService.get(currentUser(request), String(request.params.id)));
export const createTask: RequestHandler = async (request, response) => ok(response, await taskService.create(currentUser(request), String(request.params.projectId), request.body), 201);
export const updateTask: RequestHandler = async (request, response) => ok(response, await taskService.update(currentUser(request), String(request.params.id), request.body));
export const updateTaskStatus: RequestHandler = async (request, response) => ok(response, await taskService.updateStatus(currentUser(request), String(request.params.id), request.body.status));
export const deleteTask: RequestHandler = async (request, response) => { await taskService.remove(currentUser(request), String(request.params.id)); response.status(204).send(); };

