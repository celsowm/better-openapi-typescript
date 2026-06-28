import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import type { OpenApiDocument } from '../../src/core/types';

describe('compatibility: openapi 3.2 edge cases', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders query methods, additional operations, querystring parameters, and sequential media types', async () => {
    const document: OpenApiDocument = {
      openapi: '3.2.0',
      $self: 'https://api.example.test/openapi.yaml',
      components: {
        schemas: {
          Event: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['id', 'message'],
          },
        },
        mediaTypes: {
          EventStream: {
            itemSchema: { $ref: '#/components/schemas/Event' },
          },
        },
      },
      paths: {
        '/events': {
          query: {
            operationId: 'EventController.queryEvents',
            tags: ['EventController'],
            parameters: [
              {
                name: 'filter',
                in: 'querystring',
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        term: { type: 'string' },
                      },
                      required: ['term'],
                    },
                  },
                },
              },
            ],
            responses: {
              '200': {
                summary: 'Event stream',
                content: {
                  'text/event-stream': {
                    $ref: '#/components/mediaTypes/EventStream',
                  },
                },
              },
            },
          },
          additionalOperations: {
            COPY: {
              operationId: 'EventController.copyEvents',
              tags: ['EventController'],
              responses: {
                '204': {
                  summary: 'Copied',
                },
              },
            },
          },
        },
      },
    };

    const generated = await generateCompatOutput(document, { makePathsEnum: true });
    cleanup.push(generated.cleanup);

    const eventFile = await generated.read('event.ts');
    const indexFile = await generated.read('index.ts');

    expect(eventFile).toContain('query: operations["EventController.queryEvents"];');
    expect(eventFile).toContain('COPY: operations["EventController.copyEvents"];');
    expect(eventFile).toContain('querystring: {');
    expect(eventFile).toContain('filter: {');
    expect(eventFile).toContain('"application/json": {');
    expect(eventFile).toContain('term: string;');
    expect(eventFile).toContain('/** @description Event stream */');
    expect(eventFile).toContain('"text/event-stream": components["schemas"]["Event"][];');
    expect(eventFile).toContain('/** @description Copied */');
    expect(indexFile).toContain('EventControllerqueryEvents = "/events",');
    expect(indexFile).toContain('EventControllercopyEvents = "/events",');
  });
});
