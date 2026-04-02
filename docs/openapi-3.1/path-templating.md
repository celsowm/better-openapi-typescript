# Path Templating

Source:
- https://spec.openapis.org/oas/v3.1.1.html#path-templating

## Purpose

Path templating marks replaceable sections of a URL path using `{braces}`.

## Important rule

- Every template expression must correspond to a path parameter in the path item
  or in the operations under it.

## Value constraints

- Path parameter values must not contain unescaped `/`, `?`, or `#`.

## Generator implications

- Path parameter names should stay aligned with the path template.
- Templated paths should be emitted as literal string keys.
