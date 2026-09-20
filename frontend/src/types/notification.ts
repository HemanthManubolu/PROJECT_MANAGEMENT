export type NotificationType = 'TASK_ASSIGNED' | 'TASK_IN_REVIEW';
export interface Notification { id: string; recipientId: string; projectId: string | null; taskId: string | null; type: NotificationType; message: string; isRead: boolean; createdAt: string; readAt: string | null; task?: { id: string; title: string } | null; project?: { id: string; name: string } | null; }
