import { describe, expect, it } from 'vitest';
import { userCreateSchema, userUpdateSchema } from '../src/validators/user.validator.js';
import { canManageTask } from '../src/services/access.policy.js';
import { requireRoles } from '../src/middleware/auth.js';

describe('team-management and task-assignment authorization', () => {
  it('only accepts assignable non-admin roles in team mutation payloads', () => {
    expect(userCreateSchema.safeParse({ name: 'New PM', email: 'pm@example.test', password: 'SecurePass123!', role: 'PROJECT_MANAGER' }).success).toBe(true);
    expect(userCreateSchema.safeParse({ name: 'New Admin', email: 'admin2@example.test', password: 'SecurePass123!', role: 'ADMIN' }).success).toBe(false);
    expect(userUpdateSchema.safeParse({ role: 'ADMIN' }).success).toBe(false);
  });
  it('permits a PM to manage only their own project tasks', () => {
    expect(canManageTask({ id: 'pm-one', role: 'PROJECT_MANAGER' }, 'pm-one')).toBe(true);
    expect(canManageTask({ id: 'pm-one', role: 'PROJECT_MANAGER' }, 'pm-two')).toBe(false);
  });
  it('prevents developers from creating or managing project tasks', () => {
    expect(canManageTask({ id: 'developer-one', role: 'DEVELOPER' }, 'pm-one')).toBe(false);
  });
  it('allows PMs to use the developer-assignment endpoint but not admin user management', () => {
    const projectManagerRequest = { user: { id: 'pm-one', name: 'PM One', role: 'PROJECT_MANAGER' } };
    const developerRequest = { user: { id: 'developer-one', name: 'Developer One', role: 'DEVELOPER' } };
    const allowNext = (): { called: boolean; error?: unknown; next: (error?: unknown) => void } => { const result: { called: boolean; error?: unknown; next: (error?: unknown) => void } = { called: false, next: (error?: unknown): void => { result.called = true; result.error = error; } }; return result; };
    const assignmentNext = allowNext();
    requireRoles('ADMIN', 'PROJECT_MANAGER')(projectManagerRequest as never, {} as never, assignmentNext.next);
    expect(assignmentNext.error).toBeUndefined();
    const managementNext = allowNext();
    requireRoles('ADMIN')(projectManagerRequest as never, {} as never, managementNext.next);
    expect(managementNext.error).toMatchObject({ code: 'FORBIDDEN' });
    const developerNext = allowNext();
    requireRoles('ADMIN', 'PROJECT_MANAGER')(developerRequest as never, {} as never, developerNext.next);
    expect(developerNext.error).toMatchObject({ code: 'FORBIDDEN' });
  });
});
