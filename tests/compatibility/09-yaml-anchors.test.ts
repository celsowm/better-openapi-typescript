import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateTypes } from '../../src';

describe('compatibility: yaml anchors', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('reads yaml documents with anchors and aliases', async () => {
    const root = await mkdtemp(join(tmpdir(), 'better-openapi-typescript-yaml-'));

    try {
      const inputPath = join(root, 'openapi.yaml');
      const outputDir = join(root, 'generated');

      const yamlSpec = `
openapi: 3.1.0
info:
  title: YAML anchor test
  version: 1.0.0
components:
  schemas:
    BaseUser: &BaseUser
      type: object
      properties:
        id:
          type: string
        name:
          type: string
    AdminUser:
      allOf:
        - *BaseUser
        - type: object
          properties:
            admin:
              type: boolean
paths:
  /users:
    get:
      operationId: listUsers
      tags:
        - UserController
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminUser'
`;

      await writeFile(inputPath, yamlSpec.trimStart(), 'utf-8');

      await generateTypes({
        inputPath,
        outputDir,
        cleanOutput: true,
        lineEnding: '\n',
        includeDoNotEditHeader: true,
        logLevel: 'error',
        makePathsEnum: false,
      });

      const userFile = await readFile(join(outputDir, 'user.ts'), 'utf-8');
      const commonFile = await readFile(join(outputDir, 'common.ts'), 'utf-8');

      expect(userFile + commonFile).toContain('BaseUser');
      expect(userFile + commonFile).toContain('AdminUser');
      expect(userFile).toContain('admin?: boolean;');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 120000);
});
