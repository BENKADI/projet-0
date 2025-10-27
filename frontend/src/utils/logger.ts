/**
 * Utilitaire de logging conditionnel pour le développement
 * Évite la pollution des logs en production
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

const devLog = (level: LogLevel, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console[level](...args);
  }
};

export const logger = {
  log: (...args: any[]) => devLog('log', ...args),
  error: (...args: any[]) => devLog('error', ...args),
  warn: (...args: any[]) => devLog('warn', ...args),
  info: (...args: any[]) => devLog('info', ...args),
  debug: (...args: any[]) => devLog('debug', ...args),
};

export default logger;
