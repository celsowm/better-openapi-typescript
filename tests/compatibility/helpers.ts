import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { GenerateTypesConfig } from '../../src/application/contracts';
import { generateTypes } from '../../src';
import type { OpenApiDocument } from '../../src/core/types';

export async function generateCompatOutput(
  document: OpenApiDocument,
  configOverrides: Partial<GenerateTypesConfig> = {},
) {
  const root = await mkdtemp(join(tmpdir(), 'better-openapi-typescript-compat-'));
  const inputPath = join(root, 'openapi.json');
  const outputDir = join(root, 'generated');

  await writeFile(inputPath, JSON.stringify(document, null, 2), 'utf-8');

  await generateTypes({
    inputPath,
    outputDir,
    cleanOutput: true,
    lineEnding: '\n',
    includeDoNotEditHeader: true,
    logLevel: 'error',
    makePathsEnum: false,
    ...configOverrides,
  });

  return {
    root,
    inputPath,
    outputDir,
    async read(relativePath: string) {
      return readFile(join(outputDir, relativePath), 'utf-8');
    },
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}
