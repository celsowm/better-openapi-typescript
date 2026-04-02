import { collectOperationSchemaRefs } from './schemaRefCollector';
import type { OpenApiSchema, TagGroup } from './types';

export function collectTagSchemas(
  tagGroups: Map<string, TagGroup>,
  schemas: Record<string, OpenApiSchema>,
): Map<string, Set<string>> {
  const tagSchemas = new Map<string, Set<string>>();

  for (const [tag, group] of tagGroups) {
    tagSchemas.set(tag, collectOperationSchemaRefs(group, schemas));
  }

  return tagSchemas;
}

export function classifySchemas(
  schemas: Record<string, OpenApiSchema>,
  tagSchemas: Map<string, Set<string>>,
): { sharedSchemas: Set<string>; exclusiveSchemas: Map<string, string> } {
  const schemaOwnership = new Map<string, Set<string>>();

  for (const [tag, schemaNames] of tagSchemas) {
    for (const schemaName of schemaNames) {
      if (!schemaOwnership.has(schemaName)) {
        schemaOwnership.set(schemaName, new Set());
      }
      schemaOwnership.get(schemaName)!.add(tag);
    }
  }

  const sharedSchemas = new Set<string>();
  const exclusiveSchemas = new Map<string, string>();

  for (const [schemaName, tags] of schemaOwnership) {
    if (tags.size > 1) {
      sharedSchemas.add(schemaName);
      continue;
    }
    exclusiveSchemas.set(schemaName, [...tags][0]);
  }

  for (const schemaName of Object.keys(schemas)) {
    if (!schemaOwnership.has(schemaName)) {
      sharedSchemas.add(schemaName);
    }
  }

  return { sharedSchemas, exclusiveSchemas };
}
