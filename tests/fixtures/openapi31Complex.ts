import type { OpenApiDocument } from '../../src/core/types';

export const openapi31ComplexDocument: OpenApiDocument = {
  components: {
    schemas: {
      BaseUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
      },
      AdminUser: {
        $ref: '#/components/schemas/BaseUser',
        type: 'object',
        properties: {
          active: { type: 'boolean' },
        },
        required: ['active'],
      },
      SearchTuple: {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'integer' }],
        items: false,
      },
      FlexibleMap: {
        type: 'object',
        additionalProperties: { type: 'integer' },
      },
      OpenMap: {
        type: 'object',
        additionalProperties: true,
      },
      PatternMap: {
        type: 'object',
        patternProperties: {
          '^x-': { type: 'string' },
        },
        additionalProperties: false,
      },
      NullableId: {
        type: ['string', 'null'],
        nullable: true,
      },
      MixedState: {
        oneOf: [{ const: 'open' }, { const: 'closed' }],
      },
      ConditionalChoice: {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          aOnly: { type: 'string' },
          bOnly: { type: 'number' },
        },
        required: ['kind'],
        if: {
          properties: {
            kind: { const: 'a' },
          },
          required: ['kind'],
        },
        then: {
          type: 'object',
          properties: {
            aOnly: { type: 'string' },
          },
          required: ['aOnly'],
        },
        else: {
          type: 'object',
          properties: {
            bOnly: { type: 'number' },
          },
          required: ['bOnly'],
        },
      },
      DependentShape: {
        type: 'object',
        properties: {
          trigger: { type: 'string' },
          dependentValue: { type: 'string' },
        },
        required: ['trigger'],
        dependentSchemas: {
          trigger: {
            type: 'object',
            properties: {
              dependentValue: { type: 'string' },
            },
            required: ['dependentValue'],
          },
        },
      },
      ForbiddenString: {
        not: { type: 'string' },
      },
    },
  },
  paths: {
    '/complex': {
      get: {
        operationId: 'ComplexController.get',
        tags: ['ComplexController'],
        responses: {
          '200': {
            description: 'Complex payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/AdminUser' },
                    tuple: { $ref: '#/components/schemas/SearchTuple' },
                    map: { $ref: '#/components/schemas/FlexibleMap' },
                    openMap: { $ref: '#/components/schemas/OpenMap' },
                    patterned: { $ref: '#/components/schemas/PatternMap' },
                    nullable: { $ref: '#/components/schemas/NullableId' },
                    mixed: { $ref: '#/components/schemas/MixedState' },
                    conditional: { $ref: '#/components/schemas/ConditionalChoice' },
                    dependent: { $ref: '#/components/schemas/DependentShape' },
                    forbidden: { $ref: '#/components/schemas/ForbiddenString' },
                    'user-name': { type: 'string' },
                    default: { type: 'boolean' },
                  },
                  required: [
                    'user',
                    'tuple',
                    'map',
                    'openMap',
                    'patterned',
                    'nullable',
                    'mixed',
                    'conditional',
                    'dependent',
                    'forbidden',
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/admin': {
      get: {
        operationId: 'AdminController.get',
        tags: ['AdminController'],
        responses: {
          '200': {
            description: 'Shared user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BaseUser' },
              },
            },
          },
        },
      },
    },
  },
};
