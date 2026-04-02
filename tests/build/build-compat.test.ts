import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function runNpm(args: string[]) {
  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], {
      cwd: resolve('.'),
      encoding: 'utf-8',
    });
  }

  return spawnSync('npm', args, {
    cwd: resolve('.'),
    encoding: 'utf-8',
  });
}

describe('build: compatibility', () => {
  it('builds dual esm+cjs and npm pack dry-run works', async () => {
    const build = runNpm(['run', 'build']);
    if (build.status !== 0) {
      throw new Error([build.stdout, build.stderr].filter(Boolean).join('\n'));
    }

    const esmPath = resolve('dist/index.mjs');
    const cjsPath = resolve('dist/index.cjs');
    const cliPath = resolve('dist/cli.mjs');

    expect(existsSync(esmPath)).toBe(true);
    expect(existsSync(cjsPath)).toBe(true);
    expect(existsSync(cliPath)).toBe(true);

    const esmModule = await import(esmPath);
    expect(typeof esmModule.generateTypes).toBe('function');

    const require = createRequire(import.meta.url);
    const cjsModule = require(cjsPath);
    expect(typeof cjsModule.generateTypes).toBe('function');

    const pack = runNpm(['pack', '--dry-run']);
    if (pack.status !== 0) {
      throw new Error([pack.stdout, pack.stderr].filter(Boolean).join('\n'));
    }
  }, 120000);
});
