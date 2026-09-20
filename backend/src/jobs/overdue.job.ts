import cron from 'node-cron';
import { TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
export async function markOverdueTasks(): Promise<number> {
  const result = await prisma.task.updateMany({ where: { dueDate: { lt: new Date() }, status: { not: TaskStatus.DONE }, isOverdue: false }, data: { isOverdue: true } });
  return result.count;
}
export const scheduleOverdueJob = () => cron.schedule('5 * * * *', () => { void markOverdueTasks(); }, { timezone: 'UTC' });
