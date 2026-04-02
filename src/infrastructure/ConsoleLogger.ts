import type { ILogger, LogLevel } from '../application/contracts';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

export class ConsoleLogger implements ILogger {
  constructor(private readonly minLevel: LogLevel) {}

  info(message: string): void {
    if (LEVEL_WEIGHT.info >= LEVEL_WEIGHT[this.minLevel]) {
      console.info(message);
    }
  }

  warn(message: string): void {
    if (LEVEL_WEIGHT.warn >= LEVEL_WEIGHT[this.minLevel]) {
      console.warn(message);
    }
  }

  error(message: string): void {
    if (LEVEL_WEIGHT.error >= LEVEL_WEIGHT[this.minLevel]) {
      console.error(message);
    }
  }
}
