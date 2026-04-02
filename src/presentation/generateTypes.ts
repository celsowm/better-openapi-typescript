import type { GenerateResult, GenerateTypesConfig } from '../application/contracts';
import { GenerateTypesUseCase } from '../application/GenerateTypesUseCase';
import { DefaultOpenApiEmitter } from '../emitter/DefaultOpenApiEmitter';
import { ConsoleLogger } from '../infrastructure/ConsoleLogger';
import { NodeFileSystem } from '../infrastructure/NodeFileSystem';
import { JsonSpecLoader } from '../infrastructure/JsonSpecLoader';
import { buildDefaultConfig } from './config';

export async function generateTypes(
  config: GenerateTypesConfig,
): Promise<GenerateResult> {
  const finalConfig = buildDefaultConfig(config);
  const fileSystem = new NodeFileSystem();
  const specLoader = new JsonSpecLoader((path) => fileSystem.readText(path));
  const emitter = new DefaultOpenApiEmitter();
  const logger = new ConsoleLogger(finalConfig.logLevel);

  const useCase = new GenerateTypesUseCase(specLoader, fileSystem, emitter, logger);
  return useCase.execute(finalConfig);
}
