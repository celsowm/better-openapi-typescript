# better-openapi-typescript

OpenAPI to TypeScript generator that splits output into **one file per controller tag** instead of a single monolithic file. Produces clean, maintainable types with full ESM/CJS support.

## Why this exists

Tools like `openapi-typescript` emit everything into one massive file. For large APIs this becomes hard to navigate, slow for editors to type-check, and painful for git diffs.

`better-openapi-typescript` solves this by:

- **Splitting by tag** — each controller gets its own file
- **Shared `common.ts`** — schemas used across controllers live in one place
- **Clean output** — idiomatic TypeScript with no unnecessary parentheses or noise
- **Fast incremental checks** — editors only re-check the files you touch

## Install

```bash
npm i better-openapi-typescript
```

## CLI

```bash
npx better-openapi-typescript --input ./openapi.json --output ./src/api/generated-v2
```

### Flags

| Flag | Description |
|---|---|
| `--input <path>` | Path to OpenAPI JSON or YAML file (required) |
| `--output <path>` | Output directory (required) |
| `--clean` | Remove output directory before writing (default) |
| `--no-clean` | Keep existing files in output directory |
| `--make-paths-enum` | Emit an `ApiPaths` enum in `index.ts` |
| `--log-level` | `info` \| `warn` \| `error` (default: `info`) |

## Programmatic API

```ts
import { generateTypes } from 'better-openapi-typescript';

await generateTypes({
  inputPath: './openapi.json',
  outputDir: './src/api/generated-v2',
  cleanOutput: true,
  lineEnding: '\n',
  includeDoNotEditHeader: true,
  logLevel: 'info',
  makePathsEnum: false,
});
```

### `GenerateTypesConfig`

| Property | Type | Default | Description |
|---|---|---|---|
| `inputPath` | `string` | — | Path to the OpenAPI spec file |
| `outputDir` | `string` | — | Directory to write generated files |
| `cleanOutput` | `boolean` | `true` | Delete `outputDir` contents before writing |
| `lineEnding` | `string` | `'\n'` | Line ending for generated files |
| `includeDoNotEditHeader` | `boolean` | `true` | Add "Do not edit manually" comment |
| `logLevel` | `'info' \| 'warn' \| 'error'` | `'info'` | Console verbosity |
| `makePathsEnum` | `boolean` | `false` | Emit `ApiPaths` enum in `index.ts` |

## Output structure

```
src/api/generated-v2/
├── index.ts          # Re-exports all controller files
├── common.ts         # Shared schemas used by multiple controllers
├── acervo.ts         # types + paths + operations for AcervoController
├── pessoa.ts         # types + paths + operations for PessoaController
└── ...               # one file per tag
```

Each controller file exports three interfaces:

- **`components`** — schemas scoped to that controller, extending `common.ts`
- **`paths`** — OpenAPI path definitions
- **`operations`** — request/response types for each operation

## Compatibility

- OpenAPI 3.0.x, 3.1.x, and 3.2.x
- JSON and YAML specs (with YAML anchor support)
- ESM and CommonJS consumers

### OpenAPI 3.2 support

The generator supports OpenAPI 3.2 features that affect emitted TypeScript:

- `query` operations and Path Item `additionalOperations`
- `querystring` parameters, including content-based parameters
- sequential media type payloads with `itemSchema`
- reusable `components.mediaTypes` references
- response `summary` comments when `description` is not present

## Development

```bash
npm run build        # Compile with tsup
npm run typecheck    # Type-check only
npm run lint         # Alias for typecheck
npm test             # Run vitest suite
npm run compat:pgedigital  # Run real-world compatibility check
```

## License

MIT
