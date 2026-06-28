export interface OpenApiDocument {
  openapi?: string;
  $self?: string;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    mediaTypes?: Record<string, OpenApiMediaType>;
  };
  paths?: Record<string, OpenApiPathItem>;
}

export interface OpenApiPathItem {
  additionalOperations?: Record<string, OpenApiOperation>;
  [method: string]: OpenApiOperation | Record<string, OpenApiOperation> | unknown;
}

export interface OpenApiOperation {
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
}

export interface OpenApiParameter {
  in: 'query' | 'querystring' | 'path' | 'header' | 'cookie' | string;
  name: string;
  required?: boolean;
  schema?: OpenApiSchema;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiRequestBody {
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponse {
  summary?: string;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
  $ref?: string;
  schema?: OpenApiSchema;
  itemSchema?: OpenApiSchema;
  prefixEncoding?: unknown;
  itemEncoding?: unknown;
  [key: string]: unknown;
}

export type OpenApiSchema = boolean | OpenApiSchemaObject;

export interface OpenApiSchemaObject {
  $ref?: string;
  type?: string | string[];
  discriminator?: {
    propertyName?: string;
    mapping?: Record<string, string>;
    defaultMapping?: string;
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
