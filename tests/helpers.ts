import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function listFilesRecursive(root: string): Promise<string[]> {
  const output: string[] = [];

  async function walk(current: string, prefix: string): Promise<void> {
    const entries = await readdir(current);
    entries.sort((a, b) => a.localeCompare(b));

    for (const entry of entries) {
      const fullPath = join(current, entry);
      const relativePath = prefix ? join(prefix, entry) : entry;
      const entryStat = await stat(fullPath);
      if (entryStat.isDirectory()) {
        await walk(fullPath, relativePath);
        continue;
      }
      output.push(relativePath.replace(/\\/g, '/'));
    }
  }

  await walk(root, '');
  return output;
}

export async function readFilesByRelativePath(
  root: string,
  files: string[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  for (const file of files) {
    const content = await readFile(join(root, file), 'utf-8');
    result[file] = content;
  }

  return result;
}
