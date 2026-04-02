# OpenAPI 3.1 overview

Source:
- https://spec.openapis.org/oas/v3.1.1.html#openapi-specification

## What OpenAPI is

OpenAPI describes an API contract in a machine-readable format. It is designed to
describe requests, responses, authentication, and reusable schemas for tooling.

## Core definitions

- OpenAPI Description: a resource that defines one API.
- OpenAPI Document: the serialized description itself.
- Schema: the data model used for requests, responses, and reusable components.
- Path Templating: URI paths can include variables such as `/users/{id}`.
- Media Types: request and response bodies are keyed by media type.
- HTTP Status Codes: responses are commonly grouped by status code or status range.

## Important spec traits

- OpenAPI 3.1 aligns with JSON Schema Draft 2020-12 for schemas.
- Schema objects can be objects, arrays, primitives, or boolean schemas.
- Relative references are allowed and must be resolved carefully by tooling.
- The spec distinguishes between normative rules and implementation-defined behavior.

## Why this matters for generators

- Schema composition has to respect `allOf`, `oneOf`, `anyOf`, and `not`.
- Path objects need deterministic ordering and predictable naming.
- Discriminator support depends on schema shape and reference structure.
- OpenAPI 3.1 features such as `nullable`, `prefixItems`, and `unevaluatedProperties`
  require more than a basic OpenAPI 3.0 model.
