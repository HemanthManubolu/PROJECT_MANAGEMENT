import { Router } from 'express';
import { dashboard } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
export const dashboardRouter = Router();
dashboardRouter.get('/', authenticate, asyncHandler(dashboard));
