import winston from "winston";

export interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

export function createLogger(service: string): Logger {
  const logLevel = process.env.LOG_LEVEL ?? "info";

  const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [new winston.transports.Console()],
  });

  return {
    debug: (message: string, meta?: Record<string, any>) => {
      logger.debug(message, meta);
    },
    info: (message: string, meta?: Record<string, any>) => {
      logger.info(message, meta);
    },
    warn: (message: string, meta?: Record<string, any>) => {
      logger.warn(message, meta);
    },
    error: (message: string, meta?: Record<string, any>) => {
      logger.error(message, meta);
    },
  };
}
