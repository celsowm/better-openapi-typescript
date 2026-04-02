import type { GenerateTypesConfig } from '../application/contracts';

export function buildDefaultConfig(
  partial: Partial<GenerateTypesConfig> = {},
): GenerateTypesConfig {
  return {
    inputPath: partial.inputPath ?? '',
    outputDir: partial.outputDir ?? '',
    cleanOutput: partial.cleanOutput ?? true,
    lineEnding: partial.lineEnding ?? '\n',
    includeDoNotEditHeader: partial.includeDoNotEditHeader ?? true,
    logLevel: partial.logLevel ?? 'info',
    makePathsEnum: partial.makePathsEnum ?? false,
  };
}
