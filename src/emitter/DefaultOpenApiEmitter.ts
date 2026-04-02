import type {
  EmitResult,
  EmitterContext,
  GeneratedFile,
  IEmitter,
} from '../application/contracts';
import { collectDiscriminatorRelations } from '../core/discriminator';
import { getHttpMethods, groupPathsByTag } from '../core/tagGrouper';
import { collectTagSchemas, classifySchemas } from '../core/schemaOwnershipClassifier';
import { makeApiPathEnumMember, pascalToKebab, stripControllerSuffix } from '../core/naming';
import {
  formatPropertyKey,
  isFalseSchema,
  isSchemaObject,
  isTrueSchema,
  joinIntersection,
  joinUnion,
  schemaRefName,
  wrapArrayItem,
  wrapForIntersection,
  wrapForUnion,
} from '../core/schemaHelpers';
import type {
  OpenApiOperation,
  OpenApiParameter,
  OpenApiResponse,
  OpenApiSchema,
  OpenApiSchemaObject,
  TagGroup,
} from '../core/types';

const INDENT = '    ';
const NEVER_PARAMETER_KEYS = ['query', 'header', 'path', 'cookie'];
const DOC_START = '/**';
const DOC_END = ' */';
const DO_NOT_EDIT_MANUALLY = ' * Do not edit manually.';

export class DefaultOpenApiEmitter implements IEmitter {
  emit(context: EmitterContext): EmitResult {
    const eol = context.lineEnding;
    const spec = context.spec;
    const schemas = spec.components?.schemas ?? {};
    const paths = spec.paths ?? {};

    const tagGroups = groupPathsByTag(paths);
    const tagSchemas = collectTagSchemas(tagGroups, schemas);
    const { sharedSchemas, exclusiveSchemas } = classifySchemas(schemas, tagSchemas);
    const discriminatorRelations = collectDiscriminatorRelations(schemas);
    const tagFileNames = new Map<string, string>();

    const files: GeneratedFile[] = [];
    files.push(
        this.buildCommonFile(
          sharedSchemas,
          schemas,
          eol,
          context.includeDoNotEditHeader,
          discriminatorRelations,
        ),
    );

    for (const [tag, group] of tagGroups) {
      files.push(
        this.buildTagFile(
          tag,
          group,
          exclusiveSchemas,
          schemas,
          discriminatorRelations,
          tagFileNames,
          eol,
          context.includeDoNotEditHeader,
        ),
      );
    }

    files.push(
      this.buildIndexFile(
        tagGroups,
        paths,
        tagFileNames,
        eol,
        context.includeDoNotEditHeader,
        context.makePathsEnum,
      ),
    );

    return {
      files,
      summary: {
        tagCount: tagGroups.size,
        sharedSchemaCount: sharedSchemas.size,
        exclusiveSchemaCount: exclusiveSchemas.size,
      },
    };
  }

  private buildCommonFile(
    sharedSchemas: Set<string>,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
    includeHeader: boolean,
    discriminatorRelations: Map<string, { baseSchemaName: string; propertyName: string; values: string[] }>,
  ): GeneratedFile {
    const lines: string[] = [];
    this.pushGeneratedFileHeader(
      lines,
      'Auto-generated shared schemas (referenced by 2+ controllers).',
      includeHeader,
    );

    lines.push('export interface components {');
    this.pushLine(lines, 1, 'schemas: {');

    for (const name of [...sharedSchemas].sort()) {
      const schema = schemas[name];
      if (!schema) {
        continue;
      }
      lines.push(this.indent(this.emitSchema(name, schema, schemas, discriminatorRelations, eol, name), 2, eol));
    }

    this.pushLine(lines, 1, '};');
    lines.push('}');

    return {
      relativePath: 'common.ts',
      content: lines.join(eol) + eol,
    };
  }

  private buildTagFile(
    tag: string,
    group: TagGroup,
    exclusiveSchemas: Map<string, string>,
    schemas: Record<string, OpenApiSchema>,
    discriminatorRelations: Map<string, { baseSchemaName: string; propertyName: string; values: string[] }>,
    tagFileNames: Map<string, string>,
    eol: string,
    includeHeader: boolean,
  ): GeneratedFile {
    const fileName = pascalToKebab(tag);
    tagFileNames.set(tag, fileName);

    const tagExclusiveSchemas: string[] = [];
    for (const [name, owner] of exclusiveSchemas) {
      if (owner === tag) {
        tagExclusiveSchemas.push(name);
      }
    }
    tagExclusiveSchemas.sort();

    const lines: string[] = [];
    this.pushGeneratedFileHeader(lines, `Auto-generated types for ${tag}.`, includeHeader);
    lines.push("import type { components as commonComponents } from './common';");
    lines.push('');

    lines.push('export interface components {');
    this.pushLine(lines, 1, 'schemas: commonComponents["schemas"] & {');
    for (const name of tagExclusiveSchemas) {
      const schema = schemas[name];
      if (!schema) {
        continue;
      }
      lines.push(this.indent(this.emitSchema(name, schema, schemas, discriminatorRelations, eol, name), 2, eol));
    }
    this.pushLine(lines, 1, '};');
    lines.push('}');
    lines.push('');

    lines.push('export interface paths {');
    for (const pathUrl of Object.keys(group.paths).sort()) {
      lines.push(this.indent(this.emitPath(pathUrl, group.paths[pathUrl], eol), 1, eol));
    }
    lines.push('}');
    lines.push('');

    lines.push('export interface operations {');
    for (const opId of Object.keys(group.operations).sort()) {
      const { def } = group.operations[opId];
      lines.push(this.indent(this.emitOperation(opId, def, schemas, eol), 1, eol));
    }
    lines.push('}');

    return {
      relativePath: `${fileName}.ts`,
      content: lines.join(eol) + eol,
    };
  }

  private buildIndexFile(
    tagGroups: Map<string, TagGroup>,
    paths: Record<string, Record<string, unknown>>,
    tagFileNames: Map<string, string>,
    eol: string,
    includeHeader: boolean,
    makePathsEnum: boolean,
  ): GeneratedFile {
    const sortedTags = [...tagGroups.keys()].sort();
    const lines: string[] = [];

    this.pushGeneratedFileHeader(
      lines,
      'Aggregated types — compatible with openapi-fetch createClient<paths>().',
      includeHeader,
    );

    for (const tag of sortedTags) {
      const fileName = tagFileNames.get(tag)!;
      const prefix = stripControllerSuffix(tag);
      lines.push(
        `import type { components as ${prefix}Components, paths as ${prefix}Paths, operations as ${prefix}Operations } from './${fileName}';`,
      );
    }
    lines.push('');

    lines.push('export interface components {');
    if (sortedTags.length === 0) {
      this.pushLine(lines, 1, 'schemas: Record<string, never>;');
    } else {
      this.pushLine(lines, 1, 'schemas:');
      lines.push(
        `${sortedTags.map((tag) => this.line(2, `${stripControllerSuffix(tag)}Components["schemas"]`)).join(` &${eol}`)};`,
      );
    }
    lines.push('}');
    lines.push('');

    lines.push('export interface paths extends');
    lines.push(sortedTags.map((tag) => this.line(1, `${stripControllerSuffix(tag)}Paths`)).join(`,${eol}`));
    lines.push('{}');
    lines.push('');

    lines.push('export interface operations extends');
    lines.push(
      sortedTags
        .map((tag) => this.line(1, `${stripControllerSuffix(tag)}Operations`))
        .join(`,${eol}`),
    );
    lines.push('{}');
    lines.push('');

    lines.push('export type $defs = Record<string, never>;');

    if (makePathsEnum) {
      lines.push('');
      lines.push('export enum ApiPaths {');
      for (const [pathUrl, pathDef] of Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))) {
        for (const method of getHttpMethods()) {
          const operation = pathDef[method as keyof typeof pathDef] as { operationId?: string } | undefined;
          if (!operation) {
            continue;
          }
          const memberName = makeApiPathEnumMember(method, pathUrl, operation.operationId);
          lines.push(this.line(1, `${memberName} = ${JSON.stringify(pathUrl)},`));
        }
      }
      lines.push('}');
    }

    return {
      relativePath: 'index.ts',
      content: lines.join(eol) + eol,
    };
  }

  private emitSchema(
    name: string,
    schema: OpenApiSchema,
    schemas: Record<string, OpenApiSchema>,
    discriminatorRelations: Map<string, { baseSchemaName: string; propertyName: string; values: string[] }>,
    eol: string,
    schemaName?: string,
  ): string {
    const lines: string[] = [];

    if (isSchemaObject(schema) && schema.description) {
      lines.push(`/** @description ${schema.description} */`);
    }

    lines.push(`${name}: ${this.tsType(schema, schemas, eol, schemaName, discriminatorRelations)};`);

    return lines.join(eol);
  }

  private emitPath(pathUrl: string, pathDef: Record<string, OpenApiOperation>, eol: string): string {
    const lines: string[] = [];
    lines.push(`"${pathUrl}": {`);
    this.emitNeverParametersBlock(lines, 1);

    for (const method of getHttpMethods()) {
      const operation = pathDef[method as keyof typeof pathDef];
      if (operation) {
        this.pushLine(lines, 1, `${method}: operations["${operation.operationId}"];`);
      } else {
        this.pushLine(lines, 1, `${method}?: never;`);
      }
    }

    lines.push('};');
    return lines.join(eol);
  }

  private emitOperation(
    operationId: string,
    operation: OpenApiOperation,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    const lines: string[] = [];
    lines.push(`"${operationId}": {`);

    lines.push(...this.emitOperationParameters(operation.parameters ?? [], schemas, eol));

    const requestBody = operation.requestBody;
    if (requestBody?.content) {
      this.pushLine(lines, 1, 'requestBody: {');
      this.pushLine(lines, 2, 'content: {');
      lines.push(...this.emitMediaTypeEntries(requestBody.content, schemas, 3, eol));
      this.pushLine(lines, 2, '};');
      this.pushLine(lines, 1, '};');
    } else {
      this.pushLine(lines, 1, 'requestBody?: never;');
    }

    this.pushLine(lines, 1, 'responses: {');
    for (const [status, response] of Object.entries(operation.responses ?? {})) {
      const typedResponse = response as OpenApiResponse;
      if (typedResponse.description) {
        this.pushLine(lines, 2, `/** @description ${typedResponse.description} */`);
      }
      this.pushLine(lines, 2, `${status}: {`);
      this.pushLine(lines, 3, 'headers: {');
      this.pushLine(lines, 4, '[name: string]: unknown;');
      this.pushLine(lines, 3, '};');

      if (typedResponse.content) {
        this.pushLine(lines, 3, 'content: {');
        lines.push(...this.emitMediaTypeEntries(typedResponse.content, schemas, 4, eol));
        this.pushLine(lines, 3, '};');
      } else {
        this.pushLine(lines, 3, 'content?: never;');
      }

      this.pushLine(lines, 2, '};');
    }
    this.pushLine(lines, 1, '};');

    lines.push('};');
    return lines.join(eol);
  }

  private emitOperationParameters(
    parameters: OpenApiParameter[],
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string[] {
    const lines: string[] = [];
    const queryParams = parameters.filter((parameter) => parameter.in === 'query');
    const pathParams = parameters.filter((parameter) => parameter.in === 'path');

    this.pushLine(lines, 1, 'parameters: {');

    if (queryParams.length > 0) {
      const hasRequiredQuery = queryParams.some((parameter) => parameter.required);
      this.pushLine(lines, 2, `query${hasRequiredQuery ? '' : '?'}: {`);
      for (const parameter of queryParams) {
        const optional = parameter.required ? '' : '?';
        const key = formatPropertyKey(parameter.name);
        this.pushLine(
          lines,
          3,
          `${key}${optional}: ${this.tsType(parameter.schema, schemas, eol)};`,
        );
      }
      this.pushLine(lines, 2, '};');
    } else {
      this.pushLine(lines, 2, 'query?: never;');
    }

    this.pushLine(lines, 2, 'header?: never;');

    if (pathParams.length > 0) {
      this.pushLine(lines, 2, 'path: {');
      for (const parameter of pathParams) {
        const key = formatPropertyKey(parameter.name);
        this.pushLine(lines, 3, `${key}: ${this.tsType(parameter.schema, schemas, eol)};`);
      }
      this.pushLine(lines, 2, '};');
    } else {
      this.pushLine(lines, 2, 'path?: never;');
    }

    this.pushLine(lines, 2, 'cookie?: never;');
    this.pushLine(lines, 1, '};');

    return lines;
  }

  private emitNeverParametersBlock(lines: string[], indentLevel: number): void {
    this.pushLine(lines, indentLevel, 'parameters: {');
    for (const key of NEVER_PARAMETER_KEYS) {
      this.pushLine(lines, indentLevel + 1, `${key}?: never;`);
    }
    this.pushLine(lines, indentLevel, '};');
  }

  private emitMediaTypeEntries(
    content: Record<string, { schema?: OpenApiSchema }>,
    schemas: Record<string, OpenApiSchema>,
    indentLevel: number,
    eol: string,
  ): string[] {
    const lines: string[] = [];
    for (const [mediaType, mediaSchema] of Object.entries(content ?? {})) {
      lines.push(this.line(indentLevel, `"${mediaType}": ${this.tsType(mediaSchema.schema, schemas, eol)};`));
    }
    return lines;
  }

  private emitSchemaPropertyLines(
    properties: Record<string, OpenApiSchema>,
    required: Set<string>,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
    linePrefix = '',
  ): string[] {
    const lines: string[] = [];

    for (const [propertyName, propertySchema] of Object.entries(properties)) {
      const optional = required.has(propertyName) ? '' : '?';
      const comment = this.formatComment(propertySchema);
      if (comment) {
        lines.push(`${linePrefix}${comment}`);
      }
      const key = formatPropertyKey(propertyName);
      const readonlyPrefix = isSchemaObject(propertySchema) && propertySchema.readOnly ? 'readonly ' : '';
      lines.push(
        `${linePrefix}${readonlyPrefix}${key}${optional}: ${this.tsType(propertySchema, schemas, eol)};`,
      );
    }

    return lines;
  }

  private tsType(
    schema: OpenApiSchema | undefined,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
    schemaName?: string,
    discriminatorRelations?: Map<string, { baseSchemaName: string; propertyName: string; values: string[] }>,
  ): string {
    if (schema === undefined) {
      return 'unknown';
    }

    if (isTrueSchema(schema)) {
      return 'unknown';
    }

    if (isFalseSchema(schema)) {
      return 'never';
    }

    const schemaObject = schema;
    const refName = schemaRefName(schemaObject);
    const baseType = this.renderBaseSchemaType(schemaObject, schemas, eol);
    const allOfParts = this.renderAllOfParts(schemaObject.allOf, schemas, eol, schemaName, discriminatorRelations);
    const compositionType = this.renderAnyOfType(schemaObject.anyOf, schemaObject.oneOf, schemas, eol);
    const conditionalType = this.renderConditionalType(schemaObject, schemas, eol);
    const dependentSchemasType = this.renderDependentSchemasType(schemaObject, schemas, eol);
    const notType = schemaObject.not ? this.tsType(schemaObject.not, schemas, eol) : null;

    const intersectParts: string[] = [];
    if (refName) {
      intersectParts.push(`components["schemas"]["${refName}"]`);
    }
    if (baseType) {
      intersectParts.push(baseType);
    }
    if (allOfParts.length > 0) {
      intersectParts.push(...allOfParts);
    }
    if (conditionalType) {
      intersectParts.push(conditionalType);
    }
    if (dependentSchemasType) {
      intersectParts.push(dependentSchemasType);
    }

    let result = intersectParts.length === 0 ? null : joinIntersection(intersectParts);

    if (compositionType) {
      result = result ? `${wrapForIntersection(result)} & (${compositionType})` : compositionType;
    }

    if (notType) {
      result = `Exclude<${result ?? 'unknown'}, ${notType}>`;
    }

    if (schemaObject.nullable) {
      const nullableResult = result ?? 'unknown';
      result = nullableResult.includes('null')
        ? nullableResult
        : `${wrapForUnion(nullableResult)} | null`;
    }

    if (schemaName) {
      const relation = discriminatorRelations?.get(schemaName);
      if (relation) {
        const literal = joinUnion(relation.values.map((value) => JSON.stringify(value)));
        const discriminatorObject = `{ ${formatPropertyKey(relation.propertyName)}: ${literal}; }`;
        result = result ? joinIntersection([discriminatorObject, result]) : discriminatorObject;
      }
    }

    return result ?? 'unknown';
  }

  private renderBaseSchemaType(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string | null {
    if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
      return JSON.stringify(schema.const);
    }

    if (schema.enum) {
      return joinUnion(schema.enum.map((value) => JSON.stringify(value)));
    }

    if (Array.isArray(schema.type)) {
      return joinUnion(schema.type.map((type) => this.renderSingleType(type, schema, schemas, eol)));
    }

    if (schema.type) {
      return this.renderSingleType(schema.type, schema, schemas, eol);
    }

    if (schema.properties || schema.patternProperties || schema.additionalProperties !== undefined || schema.unevaluatedProperties !== undefined) {
      return this.objectType(schema, schemas, eol);
    }

    if (schema.prefixItems || schema.items !== undefined) {
      return this.arrayType(schema, schemas, eol);
    }

    return null;
  }

  private renderSingleType(
    type: string,
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    switch (type) {
      case 'string':
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'array':
        return this.arrayType(schema, schemas, eol);
      case 'object':
        return this.objectType(schema, schemas, eol);
      default:
        return 'unknown';
    }
  }

  private renderAnyOfType(
    anyOf: OpenApiSchema[] | undefined,
    oneOf: OpenApiSchema[] | undefined,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    const variants = (anyOf ?? oneOf) ?? [];
    if (variants.length === 0) {
      return '';
    }
    return joinUnion(variants.map((item) => this.tsType(item, schemas, eol)));
  }

  private renderAllOfParts(
    allOf: OpenApiSchema[] | undefined,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
    schemaName?: string,
    discriminatorRelations?: Map<string, { baseSchemaName: string; propertyName: string; values: string[] }>,
  ): string[] {
    const variants = allOf ?? [];
    if (variants.length === 0) {
      return [];
    }

    const relation = schemaName ? discriminatorRelations?.get(schemaName) : undefined;
    const parts: string[] = [];

    for (const item of variants) {
      if (relation && isSchemaObject(item) && schemaRefName(item) === relation.baseSchemaName) {
        parts.push(
          `Omit<components["schemas"]["${relation.baseSchemaName}"], ${JSON.stringify(relation.propertyName)}>`,
        );
        continue;
      }

      parts.push(this.tsType(item, schemas, eol));
    }

    return parts;
  }

  private renderConditionalType(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    if (!schema.if && !schema.then && !schema.else) {
      return '';
    }

    const branches: string[] = [];
    if (schema.then) {
      branches.push(this.tsType(schema.then, schemas, eol));
    }
    if (schema.else) {
      branches.push(this.tsType(schema.else, schemas, eol));
    }

    if (branches.length === 0) {
      return this.tsType(schema.if, schemas, eol);
    }

    return joinUnion(branches);
  }

  private renderDependentSchemasType(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    const dependentSchemas = schema.dependentSchemas;
    if (!dependentSchemas || Object.keys(dependentSchemas).length === 0) {
      return '';
    }

    const dependentTypes = Object.values(dependentSchemas).map((value) => this.tsType(value, schemas, eol));
    return joinIntersection(dependentTypes);
  }

  private objectType(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    const required = new Set(schema.required ?? []);
    const hasExplicitProps = Boolean(schema.properties && Object.keys(schema.properties).length > 0);
    const propertyLines = hasExplicitProps
      ? this.emitSchemaPropertyLines(schema.properties ?? {}, required, schemas, eol)
      : [];
    const explicitObject = hasExplicitProps
      ? `{${eol}${this.indent(propertyLines.join(eol), 3, eol)}${eol}${this.line(2, '}')}`
      : null;
    const recordParts = this.objectRecordParts(schema, schemas, eol);

    if (!explicitObject && recordParts.length === 0) {
      if (schema.additionalProperties === false || schema.unevaluatedProperties === false) {
        return 'Record<string, never>';
      }
      return 'Record<string, unknown>';
    }

    if (!explicitObject) {
      return joinIntersection(recordParts);
    }

    if (recordParts.length === 0) {
      return explicitObject;
    }

    return joinIntersection([explicitObject, ...recordParts]);
  }

  private arrayType(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string {
    const prefixItems = schema.prefixItems ?? [];
    const prefixTypes = prefixItems.map((item) => this.tsType(item, schemas, eol));
    const hasPrefixItems = prefixTypes.length > 0;
    const items = schema.items;

    if (hasPrefixItems) {
      if (items === false) {
        return `[${prefixTypes.map((type) => wrapArrayItem(type)).join(', ')}]`;
      }

      if (items === undefined || items === true) {
        return `[${prefixTypes.map((type) => wrapArrayItem(type)).join(', ')}, ...unknown[]]`;
      }

      return `[${prefixTypes.map((type) => wrapArrayItem(type)).join(', ')}, ...${wrapArrayItem(this.tsType(items, schemas, eol))}[]]`;
    }

    if (items === false) {
      return '[]';
    }

    if (items === undefined || items === true) {
      return 'unknown[]';
    }

    return `${wrapArrayItem(this.tsType(items, schemas, eol))}[]`;
  }

  private objectRecordParts(
    schema: OpenApiSchemaObject,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string[] {
    const recordParts: string[] = [];
    const patternValues = schema.patternProperties
      ? Object.values(schema.patternProperties).map((item) => this.tsType(item, schemas, eol))
      : [];

    if (patternValues.length > 0) {
      recordParts.push(`Record<string, ${joinUnion(patternValues)}>`);
    }

    const additional = this.additionalPropertiesType(schema.additionalProperties, schemas, eol);
    if (additional) {
      recordParts.push(additional);
    }

    const unevaluated = this.additionalPropertiesType(schema.unevaluatedProperties, schemas, eol);
    if (unevaluated) {
      recordParts.push(unevaluated);
    }

    return recordParts;
  }

  private additionalPropertiesType(
    value: boolean | OpenApiSchema | undefined,
    schemas: Record<string, OpenApiSchema>,
    eol: string,
  ): string | null {
    if (value === undefined || value === false) {
      return null;
    }

    if (value === true) {
      return 'Record<string, unknown>';
    }

    return `Record<string, ${this.tsType(value, schemas, eol)}>`;
  }

  private formatComment(schema: OpenApiSchema): string | null {
    if (!isSchemaObject(schema)) {
      return null;
    }

    if (schema.format) {
      return `/** Format: ${schema.format} */`;
    }
    return null;
  }

  private indent(text: string, level: number, eol: string): string {
    const spaces = INDENT.repeat(level);
    return text
      .split(eol)
      .map((line) => (line.trim() === '' ? '' : `${spaces}${line}`))
      .join(eol);
  }

  private line(level: number, content: string): string {
    return `${INDENT.repeat(level)}${content}`;
  }

  private pushLine(lines: string[], level: number, content: string): void {
    lines.push(this.line(level, content));
  }

  private pushGeneratedFileHeader(
    lines: string[],
    descriptionLine: string,
    includeHeader: boolean,
  ): void {
    if (!includeHeader) {
      return;
    }

    lines.push(DOC_START);
    lines.push(` * ${descriptionLine}`);
    lines.push(DO_NOT_EDIT_MANUALLY);
    lines.push(DOC_END);
    lines.push('');
  }
}
