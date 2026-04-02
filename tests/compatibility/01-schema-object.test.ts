import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: schema object', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders object variations inspired by upstream schema-object tests', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          SchemaObject: {
            type: 'object',
            properties: {
              required: { type: 'boolean' },
              optional: { type: 'boolean' },
              truthy: true,
              falsy: false,
              nested: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                additionalProperties: { type: 'string' },
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
              meta: {
                type: 'object',
                patternProperties: {
                  '^a': { type: 'string' },
                },
              },
              open: {
                type: 'object',
                additionalProperties: true,
              },
              closed: {
                type: 'object',
                additionalProperties: false,
              },
              flag: { type: 'string', const: 'x' },
              nullable: { type: ['string', 'null'] },
            },
            required: ['required'],
          },
        },
      },
      paths: {
        '/schema-object': {
          get: {
            operationId: 'SchemaObjectController.get',
            tags: ['SchemaObjectController'],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaObject' },
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

    const file = await generated.read('schema-object.ts');

    expect(file).toContain('required: boolean;');
    expect(file).toContain('optional?: boolean;');
    expect(file).toContain('truthy?: unknown;');
    expect(file).toContain('falsy?: never;');
    expect(file).toContain('nested?: {');
    expect(file).toContain('Record<string, string>');
    expect(file).toContain('tags?: string[];');
    expect(file).toContain('meta?: Record<string, string>;');
    expect(file).toContain('open?: Record<string, unknown>;');
    expect(file).toContain('closed?: Record<string, never>;');
    expect(file).toContain('flag?: "x";');
    expect(file).toContain('nullable?: string | null;');
  });
});
