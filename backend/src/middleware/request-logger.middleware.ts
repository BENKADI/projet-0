import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log request avec un message formaté
  logger.info(`📥 ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const emoji = res.statusCode >= 400 ? '❌' : '✅';
    const message = `${emoji} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

    if (res.statusCode >= 400) {
      logger.warn(message, {
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    } else {
      logger.info(message, {
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    }
  });

  next();
};
