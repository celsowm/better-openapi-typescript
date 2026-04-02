import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import type { IFileSystem } from '../application/contracts';

export class NodeFileSystem implements IFileSystem {
  async readText(path: string): Promise<string> {
    return readFile(path, 'utf-8');
  }

  async writeText(path: string, content: string): Promise<void> {
    await writeFile(path, content, 'utf-8');
  }

  async mkdirp(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  async rimraf(path: string): Promise<void> {
    await rm(path, { recursive: true, force: true });
  }
}
