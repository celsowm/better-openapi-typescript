import { isSchemaObject, schemaRefName } from './schemaHelpers';
import type { OpenApiSchema } from './types';

export interface DiscriminatorRelation {
  baseSchemaName: string;
  propertyName: string;
  values: string[];
}

export function collectDiscriminatorRelations(
  schemas: Record<string, OpenApiSchema>,
): Map<string, DiscriminatorRelation> {
  const discriminatorBases = new Map<
    string,
    {
      propertyName: string;
      mapping?: Record<string, string>;
    }
  >();

  for (const [name, schema] of Object.entries(schemas)) {
    if (!isSchemaObject(schema) || !schema.discriminator?.propertyName) {
      continue;
    }

    discriminatorBases.set(name, {
      propertyName: schema.discriminator.propertyName,
      mapping: schema.discriminator.mapping,
    });
  }

  const relations = new Map<string, DiscriminatorRelation>();

  for (const [name, schema] of Object.entries(schemas)) {
    if (!isSchemaObject(schema) || !Array.isArray(schema.allOf)) {
      continue;
    }

    const childRef = `#/components/schemas/${name}`;
    for (const item of schema.allOf) {
      const baseName = schemaRefName(item);
      if (!baseName) {
        continue;
      }

      const discriminator = discriminatorBases.get(baseName);
      if (!discriminator) {
        continue;
      }

      const values: string[] = [];
      if (discriminator.mapping) {
        for (const [mappedValue, mappedRef] of Object.entries(discriminator.mapping)) {
          if (mappedRef === childRef || mappedRef === name || schemaRefName({ $ref: mappedRef }) === name) {
            values.push(mappedValue);
          }
        }
      }

      if (values.length === 0) {
        values.push(name);
      }

      relations.set(name, {
        baseSchemaName: baseName,
        propertyName: discriminator.propertyName,
        values,
      });
      break;
    }
  }

  return relations;
}
