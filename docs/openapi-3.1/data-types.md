# OpenAPI 3.1 data types

Source:
- https://spec.openapis.org/oas/v3.1.1.html#data-types

## JSON Schema base

OpenAPI 3.1 schema typing follows JSON Schema Draft 2020-12. The supported
primitive families are the same core JSON Schema families:

- string
- number
- integer
- boolean
- array
- object
- null

## Format annotations

Formats refine the meaning of a type without changing the underlying JSON type.
Examples include date/time strings, email-like strings, and binary payload hints.

## Binary data

Binary payloads are represented using schema annotations rather than a brand new
primitive type. Generators need to decide how to map those annotations into their
target type system.

## Practical generator notes

- `type: ["string", "null"]` already expresses nullability directly.
- `nullable: true` is a compatibility hint from older OpenAPI versions.
- `format` should usually become documentation or a branded type, not a hard rule.
