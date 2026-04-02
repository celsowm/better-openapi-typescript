import type { OpenApiDocument } from '../core/types';

export type LogLevel = 'info' | 'warn' | 'error';

export interface GenerateTypesConfig {
  inputPath: string;
  outputDir: string;
  cleanOutput: boolean;
  lineEnding: '\n' | '\r\n';
  includeDoNotEditHeader: boolean;
  logLevel: LogLevel;
  makePathsEnum: boolean;
}

export interface GenerateResult {
  outputDir: string;
  generatedFiles: string[];
  generatedFileCount: number;
  tagCount: number;
  sharedSchemaCount: number;
  exclusiveSchemaCount: number;
}

export interface ISpecLoader {
  load(inputPath: string): Promise<OpenApiDocument>;
}

export interface IFileSystem {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  mkdirp(path: string): Promise<void>;
  rimraf(path: string): Promise<void>;
}

export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface GeneratedFile {
  relativePath: string;
  content: string;
}

export interface EmitterContext {
  spec: OpenApiDocument;
  lineEnding: string;
  includeDoNotEditHeader: boolean;
  makePathsEnum: boolean;
}

export interface EmitterSummary {
  tagCount: number;
  sharedSchemaCount: number;
  exclusiveSchemaCount: number;
}

export interface EmitResult {
  files: GeneratedFile[];
  summary: EmitterSummary;
}

export interface IEmitter {
  emit(context: EmitterContext): EmitResult;
}
