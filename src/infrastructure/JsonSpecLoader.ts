import type { ISpecLoader } from '../application/contracts';
import type { OpenApiDocument } from '../core/types';
import { parse as parseYaml } from 'yaml';

export class JsonSpecLoader implements ISpecLoader {
  constructor(private readonly readText: (path: string) => Promise<string>) {}

  async load(inputPath: string): Promise<OpenApiDocument> {
    const raw = await this.readText(inputPath);
    if (/\.(ya?ml)$/i.test(inputPath)) {
      return parseYaml(raw) as OpenApiDocument;
    }

    return JSON.parse(raw) as OpenApiDocument;
  }
}
