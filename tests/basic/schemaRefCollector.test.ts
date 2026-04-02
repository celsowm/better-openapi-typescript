import { describe, expect, it } from 'vitest';
import { collectOperationSchemaRefs } from '../../src/core/schemaRefCollector';
import type { OpenApiSchema } from '../../src/core/types';

describe('basic: schema ref collector', () => {
  it('collects refs recursively and handles cycles safely', () => {
    const schemas: Record<string, OpenApiSchema> = {
      A: { $ref: '#/components/schemas/B' },
      B: { anyOf: [{ $ref: '#/components/schemas/C' }] },
      C: { oneOf: [{ $ref: '#/components/schemas/D' }] },
      D: { allOf: [{ $ref: '#/components/schemas/A' }] },
    };

    const refs = collectOperationSchemaRefs(
      {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/A' },
            },
          },
        },
      },
      schemas,
    );

    expect([...refs].sort()).toEqual(['A', 'B', 'C', 'D']);
  });
});
