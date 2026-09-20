import { describe, expect, it } from 'vitest';
import { canAccessProject, canAccessTask, canManageTask } from '../src/services/access.policy.js';

describe('RBAC policy', () => {
  const admin = { id: 'admin', role: 'ADMIN' as const };
  const owner = { id: 'pm-one', role: 'PROJECT_MANAGER' as const };
  const otherPm = { id: 'pm-two', role: 'PROJECT_MANAGER' as const };
  const assignedDeveloper = { id: 'dev-one', role: 'DEVELOPER' as const };
  const otherDeveloper = { id: 'dev-two', role: 'DEVELOPER' as const };
  it('isolates a PM from another PM project', () => { expect(canAccessProject(owner, 'pm-one')).toBe(true); expect(canAccessProject(otherPm, 'pm-one')).toBe(false); expect(canManageTask(otherPm, 'pm-one')).toBe(false); });
  it('isolates developers to their assigned tasks', () => { const task = { assignedDeveloperId: 'dev-one', projectManagerId: 'pm-one' }; expect(canAccessTask(assignedDeveloper, task)).toBe(true); expect(canAccessTask(otherDeveloper, task)).toBe(false); expect(canAccessTask(otherPm, task)).toBe(false); });
  it('allows admin access across resources', () => { expect(canAccessProject(admin, 'pm-one')).toBe(true); expect(canAccessTask(admin, { assignedDeveloperId: 'dev-one', projectManagerId: 'pm-one' })).toBe(true); });
});
