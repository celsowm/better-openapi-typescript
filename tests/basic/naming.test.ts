import { describe, expect, it } from 'vitest';
import { pascalToKebab, stripControllerSuffix } from '../../src/core/naming';

describe('basic: naming', () => {
  it('removes the Controller suffix when present', () => {
    expect(stripControllerSuffix('UsersController')).toBe('Users');
    expect(stripControllerSuffix('Audit')).toBe('Audit');
  });

  it('converts controller names to kebab-case file names', () => {
    expect(pascalToKebab('UsersController')).toBe('users');
    expect(pascalToKebab('AuditController')).toBe('audit');
    expect(pascalToKebab('UserProfileController')).toBe('user-profile');
  });
});
