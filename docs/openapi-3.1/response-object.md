# Response Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#response-object

## Purpose

The Response Object describes an operation response, including headers, payloads,
and optional links to follow-up operations.

## Fixed fields

- `description`
- `headers`
- `content`
- `links`

## Important behavior

- `description` is required.
- Header names are case insensitive.
- Response content is keyed by media type.

## Generator implications

- Response payloads map to typed `content` sections.
- Headers may need a catch-all index signature.
- A generator should keep response status codes as literal keys.
