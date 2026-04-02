import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: discriminators', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders discriminator-based inheritance with literal tags', async () => {
    const document: OpenApiDocument = {
      components: {
        schemas: {
          Pet: {
            type: 'object',
            required: ['petType'],
            properties: {
              petType: { type: 'string' },
            },
            discriminator: {
              propertyName: 'petType',
              mapping: {
                dog: '#/components/schemas/Dog',
                poodle: '#/components/schemas/Dog',
              },
            },
          },
          Cat: {
            allOf: [{ $ref: '#/components/schemas/Pet' }],
          },
          Dog: {
            allOf: [
              { $ref: '#/components/schemas/Pet' },
              {
                type: 'object',
                properties: {
                  bark: { type: 'string' },
                },
              },
            ],
          },
        },
      },
      paths: {
        '/pets': {
          get: {
            operationId: 'listPets',
            tags: ['AnimalController'],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        { $ref: '#/components/schemas/Cat' },
                        { $ref: '#/components/schemas/Dog' },
                      ],
                    },
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

    const file = await generated.read('animal.ts');

    expect(file).toContain('Pet: {');
    expect(file).toContain('petType: string;');
    expect(file).toContain('Cat: { petType: "Cat"; } & Omit<components["schemas"]["Pet"], "petType">;');
    expect(file).toContain('petType: "dog" | "poodle"');
    expect(file).toContain('Omit<components["schemas"]["Pet"], "petType">');
    expect(file).toContain('bark?: string;');
  });
});
