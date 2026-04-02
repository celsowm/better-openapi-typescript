# better-openapi-typescript

OpenAPI -> TypeScript generator with per-tag splitting, dual ESM/CJS output, CLI and programmatic API.

## Install

```bash
npm i better-openapi-typescript
```

## CLI

```bash
npx better-openapi-typescript --input ./openapi.json --output ./src/api/generated-v2
```

Flags:

- `--input <path>` required
- `--output <path>` required
- `--clean` optional (default true)
- `--no-clean` optional
- `--make-paths-enum` optional, emits `ApiPaths` in `index.ts`
- `--log-level info|warn|error` optional (default info)

## API

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

## Compatibility tests

The `tests/compatibility` folder contains upstream-inspired cases grouped from
basic schema shapes through OpenAPI 3.1 edge cases, discriminators, and `ApiPaths`.
It also covers YAML anchors through the YAML loader path.

## Development

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
