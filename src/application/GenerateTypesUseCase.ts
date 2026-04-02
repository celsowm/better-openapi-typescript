import { dirname, join } from 'node:path';
import type {
  GenerateResult,
  GenerateTypesConfig,
  IEmitter,
  IFileSystem,
  ILogger,
  ISpecLoader,
} from './contracts';

export class GenerateTypesUseCase {
  constructor(
    private readonly specLoader: ISpecLoader,
    private readonly fileSystem: IFileSystem,
    private readonly emitter: IEmitter,
    private readonly logger: ILogger,
  ) {}

  async execute(config: GenerateTypesConfig): Promise<GenerateResult> {
    if (!config.inputPath) {
      throw new Error('Missing required config: inputPath');
    }

    if (!config.outputDir) {
      throw new Error('Missing required config: outputDir');
    }

    const spec = await this.specLoader.load(config.inputPath);
    const { files, summary } = this.emitter.emit({
      spec,
      lineEnding: config.lineEnding,
      includeDoNotEditHeader: config.includeDoNotEditHeader,
      makePathsEnum: config.makePathsEnum,
    });

    if (config.cleanOutput) {
      await this.fileSystem.rimraf(config.outputDir);
    }

    await this.fileSystem.mkdirp(config.outputDir);

    for (const file of files) {
      const fullPath = join(config.outputDir, file.relativePath);
      await this.fileSystem.mkdirp(dirname(fullPath));
      await this.fileSystem.writeText(fullPath, file.content);
    }

    this.logger.info(`Generated ${summary.tagCount} controller files + common.ts + index.ts`);
    this.logger.info(`Shared schemas: ${summary.sharedSchemaCount}`);
    this.logger.info(`Exclusive schemas: ${summary.exclusiveSchemaCount}`);
    this.logger.info(`Output: ${config.outputDir}`);

    return {
      outputDir: config.outputDir,
      generatedFiles: files.map((file) => file.relativePath),
      generatedFileCount: files.length,
      tagCount: summary.tagCount,
      sharedSchemaCount: summary.sharedSchemaCount,
      exclusiveSchemaCount: summary.exclusiveSchemaCount,
    };
  }
}
