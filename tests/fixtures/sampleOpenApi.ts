import type { OpenApiDocument } from '../../src/core/types';

export const sampleOpenApiDocument: OpenApiDocument = {
  components: {
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
        },
        required: ['total', 'page'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        required: ['id', 'name', 'meta'],
      },
      CreateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
      AuditInfo: {
        type: 'object',
        properties: {
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['createdAt'],
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
    },
  },
  paths: {
    '/users': {
      get: {
        operationId: 'UsersController.list',
        tags: ['UsersController'],
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'List users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                  required: ['items', 'meta'],
                },
              },
            },
          },
          '500': {
            description: 'Unexpected error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
      post: {
        operationId: 'UsersController.create',
        tags: ['UsersController'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '500': {
            description: 'Unexpected error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/audit': {
      get: {
        operationId: 'AuditController.list',
        tags: ['AuditController'],
        responses: {
          '200': {
            description: 'Audit entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    info: { $ref: '#/components/schemas/AuditInfo' },
                  },
                  required: ['info'],
                },
              },
            },
          },
          '500': {
            description: 'Unexpected error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
  },
};
