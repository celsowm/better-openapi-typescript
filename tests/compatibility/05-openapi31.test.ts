import { afterEach, describe, expect, it } from 'vitest';
import { generateCompatOutput } from './helpers';
import { openapi31ComplexDocument } from '../fixtures/openapi31Complex';

describe('compatibility: openapi 3.1 edge cases', () => {
  const cleanup: Array<() => void> = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      cleanup.pop()?.();
    }
  });

  it('renders 3.1-specific constructs inspired by upstream edge cases', async () => {
    const generated = await generateCompatOutput(openapi31ComplexDocument);
    cleanup.push(generated.cleanup);

    const file = await generated.read('complex.ts');

    expect(file).toContain('components["schemas"]["AdminUser"]');
    expect(file).toContain('components["schemas"]["BaseUser"] & {');
    expect(file).toContain('[string, number]');
    expect(file).toContain('Record<string, number>');
    expect(file).toContain('Record<string, unknown>');
    expect(file).toContain('Exclude<unknown, string>');
    expect(file).toContain('dependentValue: string;');
    expect(file).toContain('"user-name"?: string;');
    expect(file).toContain('"default"?: boolean;');
    expect(file).toContain('"open" | "closed"');
  });
});
