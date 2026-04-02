import type { OpenApiSchema } from './types';

const SCHEMA_REF_PREFIX = '#/components/schemas/';

export function collectSchemaRefs(
  schemaName: string,
  schemas: Record<string, OpenApiSchema>,
  visited: Set<string> = new Set(),
): void {
  if (visited.has(schemaName)) {
    return;
  }

  visited.add(schemaName);
  const schema = schemas[schemaName];
  if (!schema) {
    return;
  }

  walkRefs(schema, schemas, visited);
}

export function walkRefs(
  value: unknown,
  schemas: Record<string, OpenApiSchema>,
  visited: Set<string>,
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const maybeRef = (value as { $ref?: unknown }).$ref;
  if (typeof maybeRef === 'string' && maybeRef.startsWith(SCHEMA_REF_PREFIX)) {
    const schemaName = maybeRef.replace(SCHEMA_REF_PREFIX, '');
    collectSchemaRefs(schemaName, schemas, visited);
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    walkRefs(nested, schemas, visited);
  }
}

export function collectOperationSchemaRefs(
  operations: unknown,
  schemas: Record<string, OpenApiSchema>,
): Set<string> {
  const visited = new Set<string>();
  walkRefs(operations, schemas, visited);
  return visited;
}
