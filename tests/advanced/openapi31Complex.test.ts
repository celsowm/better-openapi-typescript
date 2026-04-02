import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTypes } from '../../src';
import { openapi31ComplexDocument } from '../fixtures/openapi31Complex';

describe('advanced: openapi 3.1 complex types', () => {
  it('renders tuples, records, ref siblings, nullable unions and quoted keys', async () => {
    const root = await mkdtemp(join(tmpdir(), 'better-openapi-typescript-31-'));

    try {
      const inputPath = join(root, 'openapi.json');
      const outputDir = join(root, 'generated');

      await writeFile(inputPath, JSON.stringify(openapi31ComplexDocument, null, 2), 'utf-8');

      await generateTypes({
        inputPath,
        outputDir,
        cleanOutput: true,
        lineEnding: '\n',
        includeDoNotEditHeader: true,
        logLevel: 'error',
        makePathsEnum: false,
      });

      const complexFile = await readFile(join(outputDir, 'complex.ts'), 'utf-8');
      const adminFile = await readFile(join(outputDir, 'admin.ts'), 'utf-8');
      const commonFile = await readFile(join(outputDir, 'common.ts'), 'utf-8');

      expect(complexFile).toContain('components["schemas"]["AdminUser"]');
      expect(complexFile).toContain('components["schemas"]["BaseUser"] & {');
      expect(complexFile).toContain('[string, number]');
      expect(complexFile).toContain('Record<string, number>');
      expect(complexFile).toContain('Record<string, unknown>');
      expect(complexFile).toContain('| null');
      expect(complexFile).toContain('Exclude<unknown, string>');
      expect(complexFile).toContain('aOnly: string;');
      expect(complexFile).toContain('bOnly: number;');
      expect(complexFile).toContain('dependentValue: string;');
      expect(complexFile).toContain('"user-name"?: string;');
      expect(complexFile).toContain('"default"?: boolean;');
      expect(complexFile).toContain('"open" | "closed"');
      expect(adminFile).toContain('BaseUser');
      expect(commonFile).toContain('BaseUser');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 120000);
});
