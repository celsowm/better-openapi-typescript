import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: readOnly and writeOnly', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('marks readOnly properties readonly and keeps writeOnly properties writable', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          Account: {
            type: 'object',
            properties: {
              id: { type: 'number', readOnly: true },
              email: { type: 'string' },
              password: { type: 'string', writeOnly: true },
            },
            required: ['email'],
          },
        },
      },
      paths: {
        '/accounts': {
          get: {
            operationId: 'AccountController.get',
            tags: ['AccountController'],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Account' },
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

    const file = await generated.read('account.ts');

    expect(file).toContain('readonly id?: number;');
    expect(file).toContain('email: string;');
    expect(file).toContain('password?: string;');
  });
});
