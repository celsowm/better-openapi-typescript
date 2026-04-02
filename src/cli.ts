#!/usr/bin/env node

import { buildDefaultConfig } from './presentation/config';
import { generateTypes } from './presentation/generateTypes';
import type { GenerateTypesConfig, LogLevel } from './application/contracts';

function parseArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function printUsage(): void {
  console.error(
    [
      'Usage: better-openapi-typescript --input <spec> --output <dir> [--clean] [--no-clean] [--make-paths-enum] [--log-level info|warn|error]',
      '',
      'Flags:',
      '  --input      Path to OpenAPI JSON file (required)',
      '  --output     Output directory (required)',
      '  --clean      Remove output directory before write (default)',
      '  --no-clean   Keep existing files in output directory',
      '  --make-paths-enum  Emit ApiPaths enum in index.ts',
      '  --log-level  info | warn | error (default: info)',
    ].join('\n'),
  );
}

function parseConfig(argv: string[]): GenerateTypesConfig {
  const inputPath = parseArgValue(argv, '--input') ?? '';
  const outputDir = parseArgValue(argv, '--output') ?? '';
  const logLevel = (parseArgValue(argv, '--log-level') ?? 'info') as LogLevel;

  const cleanOutput = hasFlag(argv, '--no-clean') ? false : true;
  const makePathsEnum = hasFlag(argv, '--make-paths-enum');
  if (hasFlag(argv, '--clean')) {
    // Explicitly set true when present, to keep CLI predictable.
  }

  return buildDefaultConfig({
    inputPath,
    outputDir,
    cleanOutput,
    logLevel,
    makePathsEnum,
  });
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const config = parseConfig(argv);

  if (!config.inputPath || !config.outputDir) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (!['info', 'warn', 'error'].includes(config.logLevel)) {
    console.error('Invalid --log-level. Expected one of: info, warn, error');
    process.exitCode = 1;
    return;
  }

  try {
    await generateTypes(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
