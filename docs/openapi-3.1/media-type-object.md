# Media Type Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#media-type-object

## Purpose

Each Media Type Object describes the schema and examples for one media type key.

## Fixed fields

- `schema`
- `example`
- `examples`
- `encoding`

## Important behavior

- `example` and `examples` are mutually exclusive.
- A media type example should match the schema and the media type format.
- `encoding` is only relevant for request bodies with multipart or form-urlencoded content.

## Generator implications

- Generators usually care most about `schema`.
- Examples are useful as documentation but rarely affect emitted TypeScript types.
- Multipart/form payloads often need richer transformation logic than JSON bodies.
