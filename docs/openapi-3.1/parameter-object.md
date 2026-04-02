# Parameter Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#parameter-object

## Purpose

Parameters describe input values attached to a request.

## Locations

- `path`
- `query`
- `header`
- `cookie`

## Core rules

- A parameter must use either `schema` or `content`, not both.
- Path parameters are required.
- Parameter names are case sensitive.
- Header names have HTTP case-insensitive semantics.

## Serialization concerns

Serialization depends on the parameter location and style. Query and path
parameters often need special treatment for arrays, objects, and empty values.

## Generator implications

- Required path params should always be emitted as required.
- Query params can be optional unless specified otherwise.
- Property names may need quoting when they are not valid TypeScript identifiers.
