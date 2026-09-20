import type { RequestHandler } from 'express';
import { projectService } from '../services/project.service.js';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
export const listProjects: RequestHandler = async (request, response) => ok(response, await projectService.list(currentUser(request)));
export const getProject: RequestHandler = async (request, response) => ok(response, await projectService.get(currentUser(request), String(request.params.id)));
export const createProject: RequestHandler = async (request, response) => ok(response, await projectService.create(currentUser(request), request.body), 201);
export const updateProject: RequestHandler = async (request, response) => ok(response, await projectService.update(currentUser(request), String(request.params.id), request.body));
export const deleteProject: RequestHandler = async (request, response) => { await projectService.remove(currentUser(request), String(request.params.id)); response.status(204).send(); };

