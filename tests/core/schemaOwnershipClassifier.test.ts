import { describe, expect, it } from 'vitest';
import { classifySchemas } from '../../src/core/schemaOwnershipClassifier';
import type { OpenApiSchema } from '../../src/core/types';

describe('core: schema ownership classifier', () => {
  it('splits schemas into shared and exclusive groups', () => {
    const schemas: Record<string, OpenApiSchema> = {
      Shared: {},
      ExclusiveUsers: {},
      ExclusiveAudit: {},
      Unused: {},
    };

    const tagSchemas = new Map<string, Set<string>>([
      ['UsersController', new Set(['Shared', 'ExclusiveUsers'])],
      ['AuditController', new Set(['Shared', 'ExclusiveAudit'])],
    ]);

    const result = classifySchemas(schemas, tagSchemas);

    expect([...result.sharedSchemas].sort()).toEqual(['Shared', 'Unused']);
    expect([...result.exclusiveSchemas.entries()].sort()).toEqual([
      ['ExclusiveAudit', 'AuditController'],
      ['ExclusiveUsers', 'UsersController'],
    ]);
  });
});
