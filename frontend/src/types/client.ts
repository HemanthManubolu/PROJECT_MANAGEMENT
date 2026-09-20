export interface Client { id: string; name: string; email: string | null; phone: string | null; company: string | null; createdAt: string; updatedAt: string; _count?: { projects: number }; }
