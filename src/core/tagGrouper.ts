import type { OpenApiOperation, OpenApiPathItem, TagGroup } from './types';

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'query'] as const;

export interface OpenApiOperationEntry {
  method: string;
  operation: OpenApiOperation;
  isAdditionalOperation: boolean;
}

export function groupPathsByTag(paths: Record<string, OpenApiPathItem>): Map<string, TagGroup> {
  const tagGroups = new Map<string, TagGroup>();

  for (const [pathUrl, pathDef] of Object.entries(paths)) {
    for (const { method, operation } of getOperationsForPath(pathDef)) {
      if (!operation.operationId) {
        continue;
      }

      const tag = operation.tags?.[0] ?? 'Uncategorized';
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, { paths: {}, operations: {} });
      }

      const group = tagGroups.get(tag)!;
      if (!group.paths[pathUrl]) {
        group.paths[pathUrl] = {};
      }

      group.paths[pathUrl][method] = operation;
      group.operations[operation.operationId] = {
        path: pathUrl,
        method,
        def: operation,
      };
    }
  }

  return tagGroups;
}

export function getHttpMethods(): readonly string[] {
  return HTTP_METHODS;
}

export function getOperationsForPath(pathDef: OpenApiPathItem): OpenApiOperationEntry[] {
  const operations: OpenApiOperationEntry[] = [];

  for (const method of HTTP_METHODS) {
    const operation = pathDef[method];
    if (isOpenApiOperation(operation)) {
      operations.push({ method, operation, isAdditionalOperation: false });
    }
  }

  const additionalOperations = pathDef.additionalOperations;
  if (additionalOperations && typeof additionalOperations === 'object') {
    for (const [method, operation] of Object.entries(additionalOperations)) {
      if (isOpenApiOperation(operation)) {
        operations.push({ method, operation, isAdditionalOperation: true });
      }
    }
  }

  return operations;
}

function isOpenApiOperation(value: unknown): value is OpenApiOperation {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
