import type { RequestHandler } from 'express';
import { activityService } from '../services/activity.service.js';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
export const listActivity: RequestHandler = async (request, response) => ok(response, await activityService.listForUser(currentUser(request)));
export const listProjectActivity: RequestHandler = async (request, response) => ok(response, await activityService.listForProject(currentUser(request), String(request.params.projectId)));

