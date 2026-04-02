import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: paths and parameters', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders operation parameters and response bodies inspired by upstream path tests', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          Post: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              body: { type: 'string' },
              published_at: { type: 'number' },
            },
            required: ['id', 'title', 'body'],
          },
        },
      },
      paths: {
        '/post/{id}': {
          get: {
            operationId: 'getPost',
            tags: ['PostController'],
            parameters: [
              { name: 'format', in: 'query', schema: { type: 'string' } },
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            ],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Post' },
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

    const file = await generated.read('post.ts');

    expect(file).toContain('query?: {');
    expect(file).toContain('format?: string;');
    expect(file).toContain('path: {');
    expect(file).toContain('id: string;');
    expect(file).toContain('"application/json": components["schemas"]["Post"];');
    expect(file).toContain('published_at?: number;');
  });
});
