# Path Item Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#path-item-object

## Purpose

A Path Item Object describes the operations available on a single path.

## Fixed fields

- `$ref`
- `summary`
- `description`
- `get`
- `put`
- `post`
- `delete`
- `options`
- `head`
- `patch`
- `trace`
- `servers`
- `parameters`

## Important behavior

- Path items can be empty when access control hides operations.
- Path item parameters apply to all operations in the path.
- Operation-level parameters can override path-level parameters, but cannot remove them.

## Generator implications

- Path item parameters must be merged into operation contexts.
- Method ordering should be deterministic.
- A split-file generator usually renders path items into typed path maps and typed operations.
