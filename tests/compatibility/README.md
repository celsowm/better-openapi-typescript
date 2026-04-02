# Compatibility Tests

This folder contains tests adapted from the upstream `openapi-typescript` test suite.
They are rewritten to exercise this package's split-file output while preserving the
same semantic scenarios: schema objects, composition, arrays, paths/parameters, and
OpenAPI 3.1 edge cases.

Coverage here is intentionally ordered from simpler cases to harder ones:
schema shapes, composition, arrays, paths/parameters, OpenAPI 3.1 behavior,
`readOnly` / `writeOnly`, discriminators, YAML anchors, and `ApiPaths`.
