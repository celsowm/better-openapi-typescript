export interface OpenApiDocument {
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
  paths?: Record<string, OpenApiPathItem>;
}

export interface OpenApiPathItem {
  [method: string]: OpenApiOperation | unknown;
}

export interface OpenApiOperation {
  operationId: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
}

export interface OpenApiParameter {
  in: 'query' | 'path' | 'header' | 'cookie' | string;
  name: string;
  required?: boolean;
  schema?: OpenApiSchema;
}

export interface OpenApiRequestBody {
  content?: Record<string, { schema?: OpenApiSchema }>;
}

export interface OpenApiResponse {
  description?: string;
  content?: Record<string, { schema?: OpenApiSchema }>;
}

export type OpenApiSchema = boolean | OpenApiSchemaObject;

export interface OpenApiSchemaObject {
  $ref?: string;
  type?: string | string[];
  discriminator?: {
    propertyName: string;
    mapping?: Record<string, string>;
  };
  properties?: Record<string, OpenApiSchema>;
  patternProperties?: Record<string, OpenApiSchema>;
  required?: string[];
  prefixItems?: OpenApiSchema[];
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  unevaluatedProperties?: boolean | OpenApiSchema;
  enum?: unknown[];
  const?: unknown;
  anyOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  not?: OpenApiSchema;
  if?: OpenApiSchema;
  then?: OpenApiSchema;
  else?: OpenApiSchema;
  dependentSchemas?: Record<string, OpenApiSchema>;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  default?: unknown;
  description?: string;
  format?: string;
  content?: Record<string, { schema?: OpenApiSchema }>;
  [key: string]: unknown;
}

export interface TagGroup {
  paths: Record<string, Record<string, OpenApiOperation>>;
  operations: Record<string, { path: string; method: string; def: OpenApiOperation }>;
}
