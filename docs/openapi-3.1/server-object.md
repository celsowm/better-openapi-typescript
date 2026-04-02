# Server Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#server-object

## Purpose

The Server Object defines the base URL used to reach the API.

## Fixed fields

- `url`
- `description`
- `variables`

## Important behavior

- Server URLs may be relative.
- Variable values are substituted into `{braces}` in the URL template.
- The API document can define multiple servers.

## Generator implications

- Server data usually does not affect TypeScript shape generation directly.
- It matters for client configuration and documentation output.
