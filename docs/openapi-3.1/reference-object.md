# Reference Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#reference-object

## Purpose

The Reference Object points to another object in the same document or an external
document. It is used across schemas, parameters, responses, headers, and more.

## Fixed fields

- `$ref`: required URI reference
- `summary`: short summary that can override the target
- `description`: description that can override the target

## Important behavior

- Additional properties are ignored.
- This differs from Schema Objects, where `$ref` can appear alongside other schema keywords.
- Relative references must be resolved using the OpenAPI reference rules.

## Generator implications

- `$ref` should resolve transitively.
- Cycles need a safe fallback.
- `$ref` handling is foundational for component reuse and discriminator support.
