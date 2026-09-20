import { describe, expect, it } from 'vitest';
import { canAccessProject, canManageTask } from '../src/services/access.policy.js';
import { projectSchema } from '../src/validators/project.validator.js';

describe('assigned project manager policy', () => {
  const admin = { id: 'admin', role: 'ADMIN' as const };
  const assignedPm = { id: 'pm-assigned', role: 'PROJECT_MANAGER' as const };
  const otherPm = { id: 'pm-other', role: 'PROJECT_MANAGER' as const };
  it('accepts an admin project-manager assignment payload', () => {
    expect(projectSchema.safeParse({ name: 'Client Launch', clientId: '15c7e0ee-5068-4a93-9f72-62cae8a41068', projectManagerId: '19d2e7f2-5bbd-423b-955a-d603040ac7a3' }).success).toBe(true);
  });
  it('allows an assigned PM, but not another PM, to access and manage the project', () => {
    expect(canAccessProject(assignedPm, 'pm-assigned')).toBe(true);
    expect(canManageTask(assignedPm, 'pm-assigned')).toBe(true);
    expect(canAccessProject(otherPm, 'pm-assigned')).toBe(false);
    expect(canManageTask(otherPm, 'pm-assigned')).toBe(false);
  });
  it('keeps global project access for admins', () => expect(canAccessProject(admin, 'pm-assigned')).toBe(true));
});
