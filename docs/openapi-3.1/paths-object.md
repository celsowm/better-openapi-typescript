# Paths and parameters

Source:
- https://spec.openapis.org/oas/v3.1.1.html#paths-object
- https://spec.openapis.org/oas/v3.1.1.html#path-item-object
- https://spec.openapis.org/oas/v3.1.1.html#parameter-object

## Paths Object

The Paths Object maps a path template to a Path Item Object. Each template can
contain path variables such as `/users/{id}`.

## Path Item Object

Path items organize operations per HTTP method and can also carry parameters that
apply to every operation in the path.

## Parameter Object

Parameters are usually separated by location:

- `query`
- `path`
- `header`
- `cookie`

Important generator rules:

- Path parameters are typically required.
- Query parameters can be optional unless the spec says otherwise.
- Property names may need quoting when they are not valid identifiers.

## Generator implications

- Path keys should preserve literal template text.
- Operations need stable method names.
- A paths enum can be useful when a client wants typed endpoint constants.
