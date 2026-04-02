import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: arrays', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders array and tuple variants inspired by upstream array tests', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          ArrayItem: { type: 'string' },
          StringArray: { type: 'array', items: { type: 'string' } },
          BooleanItems: { type: 'array', items: true },
          TupleArray: {
            type: 'array',
            prefixItems: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
            items: false,
          },
          NullableArray: { type: ['array', 'null'], items: { type: 'string' } },
          NullableItems: { type: 'array', items: { type: ['string', 'null'] } },
          RefArray: { type: 'array', items: { $ref: '#/components/schemas/ArrayItem' } },
        },
      },
      paths: {
        '/arrays': {
          get: {
            operationId: 'ArrayController.get',
            tags: ['ArrayController'],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/StringArray' },
                  },
                },
              },
            },
          },
        },
      },
    };

    const generated = await generateCompatOutput(document);
    cleanup.push(generated.cleanup);

    const arrayFile = await generated.read('array.ts');
    const commonFile = await generated.read('common.ts');

    expect(arrayFile).toContain('StringArray: string[];');
    expect(commonFile).toContain('RefArray: components["schemas"]["ArrayItem"][];');
    expect(commonFile).toContain('BooleanItems: unknown[];');
    expect(commonFile).toContain('TupleArray: [string, number, boolean];');
    expect(commonFile).toContain('NullableArray: string[] | null;');
    expect(commonFile).toContain('NullableItems: (string | null)[];');
  });
});
