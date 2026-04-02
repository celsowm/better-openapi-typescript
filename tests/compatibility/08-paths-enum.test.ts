import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: api paths enum', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders ApiPaths when makePathsEnum is enabled', async () => {
    const document: OpenApiDocument = {
      paths: {
        '/get-item': {
          get: {
            operationId: 'fetchItem',
            tags: ['PathController'],
            responses: {
              '200': { description: 'OK' },
            },
          },
        },
        '/pets': {
          post: {
            tags: ['PathController'],
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const generated = await generateCompatOutput(document, { makePathsEnum: true });
    cleanup.push(generated.cleanup);

    const file = await generated.read('index.ts');

    expect(file).toContain('export enum ApiPaths {');
    expect(file).toContain('FetchItem = "/get-item",');
    expect(file).toContain('PostPets = "/pets",');
  });
});
