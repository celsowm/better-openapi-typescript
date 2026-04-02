import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: composition', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders oneOf, anyOf and allOf inspired by upstream composition tests', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          HasString: {
            type: 'object',
            properties: {
              string: { type: 'string' },
            },
          },
          HasNumber: {
            type: 'object',
            properties: {
              number: { type: 'number' },
            },
          },
          PrimitiveUnion: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          ObjectUnion: {
            oneOf: [
              { type: 'object', properties: { foo: { type: 'string' } } },
              { type: 'object', properties: { bar: { type: 'string' } } },
            ],
          },
          AllOfPair: {
            allOf: [
              { $ref: '#/components/schemas/HasString' },
              { $ref: '#/components/schemas/HasNumber' },
            ],
          },
          NullableChoice: {
            type: ['string', 'null'],
            enum: ['blue', 'green', null],
          },
        },
      },
      paths: {
        '/composition': {
          get: {
            operationId: 'CompositionController.get',
            tags: ['CompositionController'],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/AllOfPair' },
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

    const compositionFile = await generated.read('composition.ts');
    const commonFile = await generated.read('common.ts');

    expect(commonFile).toContain('PrimitiveUnion: string | number;');
    expect(commonFile).toContain('ObjectUnion:');
    expect(commonFile).toContain('foo?: string;');
    expect(commonFile).toContain('bar?: string;');
    expect(commonFile).toContain('NullableChoice: "blue" | "green" | null;');
    expect(compositionFile).toContain('AllOfPair: components["schemas"]["HasString"] & components["schemas"]["HasNumber"];');
  });
});
