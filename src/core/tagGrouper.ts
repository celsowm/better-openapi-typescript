import type { OpenApiPathItem, TagGroup } from './types';

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export function groupPathsByTag(paths: Record<string, OpenApiPathItem>): Map<string, TagGroup> {
  const tagGroups = new Map<string, TagGroup>();

  for (const [pathUrl, pathDef] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathDef[method];
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const op = operation as {
        tags?: string[];
        operationId?: string;
      };

      if (!op.operationId) {
        continue;
      }

      const tag = op.tags?.[0] ?? 'Uncategorized';
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, { paths: {}, operations: {} });
      }

      const group = tagGroups.get(tag)!;
      if (!group.paths[pathUrl]) {
        group.paths[pathUrl] = {};
      }

      group.paths[pathUrl][method] = operation as never;
      group.operations[op.operationId] = {
        path: pathUrl,
        method,
        def: operation as never,
      };
    }
  }

  return tagGroups;
}

export function getHttpMethods(): readonly string[] {
  return HTTP_METHODS;
}
