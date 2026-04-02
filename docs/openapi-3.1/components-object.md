# Components Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#components-object

## Purpose

The Components Object holds reusable definitions. Objects declared here only affect
the API when they are referenced from outside the component section.

## Common reusable buckets

- `schemas`
- `responses`
- `parameters`
- `examples`
- `requestBodies`
- `headers`
- `securitySchemes`
- `links`
- `callbacks`
- `pathItems`

## Naming rule

Component keys must match `^[a-zA-Z0-9.\-_]+$`.

## Generator implications

- Component names become stable type names or aliases.
- Shared schema detection usually starts here.
- A generator should preserve valid identifiers and quote or sanitize anything else.
