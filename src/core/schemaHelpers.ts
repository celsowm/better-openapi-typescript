import type { OpenApiSchema, OpenApiSchemaObject } from './types';

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED_WORDS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'as',
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'yield',
  'any',
  'unknown',
  'never',
  'number',
  'object',
  'string',
  'boolean',
  'symbol',
  'bigint',
  'undefined',
  'readonly',
]);

export function isSchemaObject(schema: OpenApiSchema | undefined): schema is OpenApiSchemaObject {
  return typeof schema === 'object' && schema !== null;
}

export function isFalseSchema(schema: OpenApiSchema | undefined): schema is false {
  return schema === false;
}

export function isTrueSchema(schema: OpenApiSchema | undefined): schema is true {
  return schema === true;
}

export function formatPropertyKey(key: string): string {
  if (IDENTIFIER_PATTERN.test(key) && !RESERVED_WORDS.has(key)) {
    return key;
  }
  return JSON.stringify(key);
}

export function wrapForIntersection(type: string): string {
  return type.includes(' | ') ? `(${type})` : type;
}

export function wrapForUnion(type: string): string {
  return type.includes(' & ') ? `(${type})` : type;
}

export function wrapArrayItem(type: string): string {
  return type.includes(' | ') || type.includes(' & ') ? `(${type})` : type;
}

export function joinUnion(types: string[]): string {
  const flat = types.map((type) => wrapForUnion(type)).filter(Boolean);
  if (flat.length === 0) {
    return 'never';
  }
  return flat.join(' | ');
}

export function joinIntersection(types: string[]): string {
  const filtered = types.filter(Boolean);
  if (filtered.length === 0) {
    return 'unknown';
  }
  if (filtered.length === 1) {
    return filtered[0];
  }
  const flat = filtered.map((type) => wrapForIntersection(type));
  return flat.join(' & ');
}

export function schemaRefName(schema: OpenApiSchema | undefined): string | null {
  if (!isSchemaObject(schema) || !schema.$ref) {
    return null;
  }
  return schema.$ref.replace('#/components/schemas/', '');
}
