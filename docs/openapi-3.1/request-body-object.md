# Request Body Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#request-body-object

## Purpose

The Request Body Object describes a single request payload.

## Fixed fields

- `description`
- `content`
- `required`

## Important behavior

- `content` is keyed by media type or media type range.
- When multiple content keys match, the most specific one wins.
- The body is optional unless `required: true`.

## Generator implications

- Request bodies usually map to typed `content` blocks.
- Media type keys should be preserved verbatim.
- Multipart and form-urlencoded content need special attention.
