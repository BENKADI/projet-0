import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../../infrastructure/monitoring/MetricsService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export class MonitoringMiddleware {
  constructor(private metricsService: MetricsService) {}

  requestMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      
      // Store start time on request for later use
      (req as any).startTime = startTime;

      // Listen for response finish
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const route = this.getRoute(req);
        
        // Record HTTP metrics
        this.metricsService.recordHttpRequest({
          method: req.method,
          route,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        });

        // Record response size if available
        const contentLength = res.get('Content-Length');
        if (contentLength) {
          this.metricsService.recordHttpResponseSize(
            req.method,
            route,
            res.statusCode,
            parseInt(contentLength, 10)
          );
        }

        // Log slow requests
        if (duration > 5000) { // 5 seconds
          console.warn(`Slow request detected: ${req.method} ${route} took ${duration}ms`);
        }

        // Log errors
        if (res.statusCode >= 400) {
          console.error(`HTTP ${res.statusCode} on ${req.method} ${route}`, {
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: (req as AuthenticatedRequest).user?.id,
          });
        }
      });

      next();
    };
  }

  errorMetrics() {
    return (error: Error, req: Request, res: Response, next: NextFunction): void => {
      const route = this.getRoute(req);
      
      // Record error metrics
      this.metricsService.recordHttpRequest({
        method: req.method,
        route,
        statusCode: 500,
        duration: Date.now() - ((req as any).startTime || Date.now()),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      // Log error details
      console.error(`Error on ${req.method} ${route}:`, {
        message: error.message,
        stack: error.stack,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: (req as AuthenticatedRequest).user?.id,
        body: this.sanitizeRequestBody(req.body),
        query: req.query,
        params: req.params,
      });

      next(error);
    };
  }

  businessMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Track business metrics based on response
        if (res.statusCode === 201 && req.route?.path.includes('/users')) {
          // New user created
          this.metricsService?.incrementNewUsers();
        }
        
        if (res.statusCode === 201 && req.route?.path.includes('/orders')) {
          // New order created
          this.metricsService?.incrementOrders('created');
        }
        
        if (req.route?.path.includes('/products') && req.method === 'POST') {
          // New product created
          // Would need to extract product data from response
        }

        return originalSend.call(this, data);
      }.bind({ metricsService: this.metricsService });

      next();
    };
  }

  performanceMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Track memory usage before request
      const memBefore = process.memoryUsage();
      
      res.on('finish', () => {
        const memAfter = process.memoryUsage();
        const memDiff = memAfter.heapUsed - memBefore.heapUsed;
        
        // Log significant memory usage
        if (memDiff > 10 * 1024 * 1024) { // 10MB
          console.warn(`High memory usage on ${req.method} ${this.getRoute(req)}: ${memDiff / 1024 / 1024}MB`);
        }
      });

      next();
    };
  }

  securityMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Track suspicious activities
      const userAgent = req.get('User-Agent') || '';
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /scanner/i,
        /sqlmap/i,
        /nmap/i,
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
      
      if (isSuspicious) {
        console.warn(`Suspicious user agent detected: ${userAgent}`, {
          ip: req.ip,
          route: this.getRoute(req),
          method: req.method,
        });
        
        // Could add metrics for suspicious requests
        // this.metricsService.incrementSuspiciousRequests();
      }

      // Track rate limit violations
      res.on('finish', () => {
        if (res.statusCode === 429) {
          console.warn(`Rate limit exceeded: ${req.method} ${this.getRoute(req)}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
          });
          
          // this.metricsService.incrementRateLimitViolations();
        }
      });

      next();
    };
  }

  databaseMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // This would integrate with your database client to track query metrics
      // For now, it's a placeholder for the concept
      
      next();
    };
  }

  cacheMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Track cache-related metrics
      const cacheHeader = req.get('If-None-Match');
      
      if (cacheHeader) {
        // Request has cache headers - could track cache hit/miss
        // this.metricsService.incrementCacheRequests();
      }

      next();
    };
  }

  private getRoute(req: Request): string {
    if (req.route) {
      return req.route.path;
    }
    
    // Fallback to URL pattern matching
    const url = req.url || '/';
    
    // Common API patterns
    if (url.startsWith('/api/v')) {
      return url.split('?')[0]; // Remove query params
    }
    
    if (url.startsWith('/health')) {
      return '/health';
    }
    
    if (url.startsWith('/metrics')) {
      return '/metrics';
    }
    
    return url.split('?')[0];
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'jwt'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Advanced monitoring features

  trackUserActivity() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (req.user) {
        // Track user-specific metrics
        const route = this.getRoute(req);
        
        // Could track user activity patterns
        // this.metricsService.recordUserActivity(req.user.id, route, req.method);
      }

      next();
    };
  }

  trackApiUsage() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const apiKey = req.get('X-API-Key');
      
      if (apiKey) {
        // Track API key usage
        // this.metricsService.recordApiKeyUsage(apiKey, this.getRoute(req));
      }

      next();
    };
  }

  trackResponseTime() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = process.hrtime.bigint();
      
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Track response time percentiles
        // this.metricsService.recordResponseTime(this.getRoute(req), duration);
        
        // Alert on very slow responses
        if (duration > 10000) { // 10 seconds
          console.error(`Very slow response: ${req.method} ${this.getRoute(req)} took ${duration}ms`);
        }
      });

      next();
    };
  }

  trackErrorRates() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const route = this.getRoute(req);
      
      res.on('finish', () => {
        if (res.statusCode >= 500) {
          // Track server errors
          // this.metricsService.incrementServerErrors(route);
        } else if (res.statusCode >= 400) {
          // Track client errors
          // this.metricsService.incrementClientErrors(route);
        }
      });

      next();
    };
  }

  trackConcurrentRequests() {
    let activeRequests = 0;
    
    return (req: Request, res: Response, next: NextFunction): void => {
      activeRequests++;
      
      // Update concurrent requests gauge
      // this.metricsService.setConcurrentRequests(activeRequests);
      
      res.on('finish', () => {
        activeRequests--;
        // this.metricsService.setConcurrentRequests(activeRequests);
      });

      next();
    };
  }

  // Health check middleware
  healthCheck() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const health = await this.metricsService.healthCheck();
        
        if (health.status === 'healthy') {
          res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            metrics: health.metrics,
          });
        } else {
          res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            metrics: health.metrics,
          });
        }
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    };
  }

  // Metrics endpoint middleware
  metricsEndpoint() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const metrics = await this.metricsService.getMetrics();
        
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve metrics',
          message: error.message,
        });
      }
    };
  }
}

// Factory function to create monitoring middleware
export function createMonitoringMiddleware(metricsService: MetricsService): MonitoringMiddleware {
  return new MonitoringMiddleware(metricsService);
}

// Convenience functions for common monitoring setups
export function setupBasicMonitoring(metricsService: MetricsService) {
  const monitoring = new MonitoringMiddleware(metricsService);
  
  return [
    monitoring.requestMetrics(),
    monitoring.errorMetrics(),
    monitoring.performanceMetrics(),
    monitoring.securityMetrics(),
  ];
}

export function setupAdvancedMonitoring(metricsService: MetricsService) {
  const monitoring = new MonitoringMiddleware(metricsService);
  
  return [
    monitoring.requestMetrics(),
    monitoring.errorMetrics(),
    monitoring.businessMetrics(),
    monitoring.performanceMetrics(),
    monitoring.securityMetrics(),
    monitoring.trackUserActivity(),
    monitoring.trackApiUsage(),
    monitoring.trackResponseTime(),
    monitoring.trackErrorRates(),
    monitoring.trackConcurrentRequests(),
  ];
}
