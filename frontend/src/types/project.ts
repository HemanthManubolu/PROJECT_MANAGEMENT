import type { Client } from './client';
import type { User } from './user';
export interface Project { id: string; name: string; description: string | null; clientId: string; createdById: string; projectManagerId: string; createdAt: string; updatedAt: string; client: Client; createdBy: User; projectManager: User; _count?: { tasks: number }; }
