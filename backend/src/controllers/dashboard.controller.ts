import type { RequestHandler } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { ok } from '../utils/response.js';
import { currentUser } from './context.js';
export const dashboard: RequestHandler = async (request, response) => ok(response, await dashboardService.get(currentUser(request)));
