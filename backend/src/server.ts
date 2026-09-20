import { createServer } from 'node:http';
import { app } from './app.mjs';
import { env } from './config/env.js';
import { scheduleOverdueJob } from './jobs/overdue.job.js';
import { initializeSocket } from './websocket/socket.js';
const server = createServer(app);
initializeSocket(server);
scheduleOverdueJob();
server.listen(env.PORT, () => console.info(`API listening on port ${env.PORT}`));
