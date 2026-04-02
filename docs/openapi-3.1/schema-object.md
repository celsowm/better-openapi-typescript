# Schema Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#schema-object

## Purpose

The Schema Object defines input and output data shapes. In OpenAPI 3.1 it is a
superset of JSON Schema Draft 2020-12.

## Key behaviors

- `true` means any value is allowed.
- `false` means no instance can validate.
- Schemas can describe objects, arrays, primitives, and combinations of those.
- Keywords from JSON Schema apply unless OpenAPI explicitly changes the meaning.

## Common fields used by generators

- `type`
- `properties`
- `required`
- `items`
- `prefixItems`
- `additionalProperties`
- `unevaluatedProperties`
- `patternProperties`
- `enum`
- `const`
- `allOf`
- `anyOf`
- `oneOf`
- `not`
- `if`, `then`, `else`
- `dependentSchemas`
- `nullable`
- `readOnly`
- `writeOnly`
- `description`
- `format`

## Fixed fields worth noting

- `discriminator`: polymorphism helper for variant schemas.
- `xml`: XML representation metadata.
- `externalDocs`: related documentation link.
- `example`: legacy example field; OpenAPI 3.1 prefers JSON Schema `examples`.

## Modeling notes

- `allOf` usually means intersection.
- `anyOf` and `oneOf` usually map to unions, but `oneOf` may require stricter handling.
- `not` is naturally expressed as `Exclude<T, U>` only in limited cases.
- Conditional keywords often need best-effort fallback in TypeScript.
