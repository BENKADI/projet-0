import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export interface MetricsConfig {
  enabled: boolean;
  prefix: string;
  labels: Record<string, string>;
}

export interface RequestMetrics {
  method: string;
  route: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
}

export interface BusinessMetrics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
  };
  orders: {
    total: number;
    revenue: number;
    pending: number;
  };
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export class MetricsService {
  private config: MetricsConfig;
  private metrics: {
    // HTTP metrics
    httpRequestsTotal: Counter<string>;
    httpRequestDuration: Histogram<string>;
    httpRequestSize: Histogram<string>;
    httpResponseSize: Histogram<string>;
    
    // Business metrics
    usersTotal: Gauge<string>;
    activeUsers: Gauge<string>;
    newUsers: Counter<string>;
    productsTotal: Gauge<string>;
    activeProducts: Gauge<string>;
    lowStockProducts: Gauge<string>;
    ordersTotal: Counter<string>;
    orderRevenue: Counter<string>;
    pendingOrders: Gauge<string>;
    
    // Performance metrics
    databaseConnections: Gauge<string>;
    cacheHitRate: Gauge<string>;
    queueLength: Gauge<string>;
    
    // System metrics
    cpuUsage: Gauge<string>;
    memoryUsage: Gauge<string>;
    diskUsage: Gauge<string>;
  };

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = {
      enabled: true,
      prefix: 'projet0_',
      labels: {},
      ...config,
    };

    this.initializeMetrics();
    this.setupDefaultMetrics();
  }

  private initializeMetrics(): void {
    const prefix = this.config.prefix;

    // HTTP metrics
    this.metrics = {
      httpRequestsTotal: new Counter({
        name: `${prefix}http_requests_total`,
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
      }),

      httpRequestDuration: new Histogram({
        name: `${prefix}http_request_duration_seconds`,
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      }),

      httpRequestSize: new Histogram({
        name: `${prefix}http_request_size_bytes`,
        help: 'Size of HTTP requests in bytes',
        labelNames: ['method', 'route'],
        buckets: [100, 1000, 10000, 100000, 1000000],
      }),

      httpResponseSize: new Histogram({
        name: `${prefix}http_response_size_bytes`,
        help: 'Size of HTTP responses in bytes',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [100, 1000, 10000, 100000, 1000000],
      }),

      // Business metrics
      usersTotal: new Gauge({
        name: `${prefix}users_total`,
        help: 'Total number of users',
      }),

      activeUsers: new Gauge({
        name: `${prefix}active_users_total`,
        help: 'Number of active users',
      }),

      newUsers: new Counter({
        name: `${prefix}new_users_total`,
        help: 'Total number of new users',
        labelNames: ['period'],
      }),

      productsTotal: new Gauge({
        name: `${prefix}products_total`,
        help: 'Total number of products',
      }),

      activeProducts: new Gauge({
        name: `${prefix}active_products_total`,
        help: 'Number of active products',
      }),

      lowStockProducts: new Gauge({
        name: `${prefix}low_stock_products_total`,
        help: 'Number of products with low stock',
      }),

      ordersTotal: new Counter({
        name: `${prefix}orders_total`,
        help: 'Total number of orders',
        labelNames: ['status', 'period'],
      }),

      orderRevenue: new Counter({
        name: `${prefix}order_revenue_total`,
        help: 'Total order revenue',
        labelNames: ['currency'],
      }),

      pendingOrders: new Gauge({
        name: `${prefix}pending_orders_total`,
        help: 'Number of pending orders',
      }),

      // Performance metrics
      databaseConnections: new Gauge({
        name: `${prefix}database_connections_active`,
        help: 'Number of active database connections',
      }),

      cacheHitRate: new Gauge({
        name: `${prefix}cache_hit_rate`,
        help: 'Cache hit rate percentage',
      }),

      queueLength: new Gauge({
        name: `${prefix}queue_length`,
        help: 'Number of items in queue',
        labelNames: ['queue_name'],
      }),

      // System metrics
      cpuUsage: new Gauge({
        name: `${prefix}cpu_usage_percent`,
        help: 'CPU usage percentage',
      }),

      memoryUsage: new Gauge({
        name: `${prefix}memory_usage_bytes`,
        help: 'Memory usage in bytes',
      }),

      diskUsage: new Gauge({
        name: `${prefix}disk_usage_bytes`,
        help: 'Disk usage in bytes',
        labelNames: ['mount_point'],
      }),
    };

    // Register all metrics
    Object.values(this.metrics).forEach(metric => register.registerMetric(metric));
  }

  private setupDefaultMetrics(): void {
    if (this.config.enabled) {
      collectDefaultMetrics({
        prefix: this.config.prefix,
        labels: this.config.labels,
      });
    }
  }

  // HTTP metrics methods
  recordHttpRequest(metrics: RequestMetrics): void {
    if (!this.config.enabled) return;

    const labels = {
      method: metrics.method,
      route: metrics.route,
      status_code: metrics.statusCode.toString(),
    };

    this.metrics.httpRequestsTotal.inc(labels);
    this.metrics.httpRequestDuration.observe(labels, metrics.duration / 1000);

    if (metrics.userAgent) {
      // Record request size if available
      const size = Buffer.byteLength(metrics.userAgent, 'utf8');
      this.metrics.httpRequestSize.observe(
        { method: metrics.method, route: metrics.route },
        size
      );
    }
  }

  recordHttpResponseSize(method: string, route: string, statusCode: number, size: number): void {
    if (!this.config.enabled) return;

    this.metrics.httpResponseSize.observe(
      { method, route, status_code: statusCode.toString() },
      size
    );
  }

  // Business metrics methods
  updateUsersMetrics(total: number, active: number): void {
    if (!this.config.enabled) return;

    this.metrics.usersTotal.set(total);
    this.metrics.activeUsers.set(active);
  }

  incrementNewUsers(period: string = 'daily'): void {
    if (!this.config.enabled) return;

    this.metrics.newUsers.inc({ period });
  }

  updateProductsMetrics(total: number, active: number, lowStock: number): void {
    if (!this.config.enabled) return;

    this.metrics.productsTotal.set(total);
    this.metrics.activeProducts.set(active);
    this.metrics.lowStockProducts.set(lowStock);
  }

  incrementOrders(status: string, period: string = 'daily'): void {
    if (!this.config.enabled) return;

    this.metrics.ordersTotal.inc({ status, period });
  }

  incrementOrderRevenue(amount: number, currency: string = 'USD'): void {
    if (!this.config.enabled) return;

    this.metrics.orderRevenue.inc({ currency }, amount);
  }

  updatePendingOrders(count: number): void {
    if (!this.config.enabled) return;

    this.metrics.pendingOrders.set(count);
  }

  // Performance metrics methods
  updateDatabaseConnections(count: number): void {
    if (!this.config.enabled) return;

    this.metrics.databaseConnections.set(count);
  }

  updateCacheHitRate(hitRate: number): void {
    if (!this.config.enabled) return;

    this.metrics.cacheHitRate.set(hitRate);
  }

  updateQueueLength(queueName: string, length: number): void {
    if (!this.config.enabled) return;

    this.metrics.queueLength.set({ queue_name: queueName }, length);
  }

  // System metrics methods
  updateCpuUsage(percentage: number): void {
    if (!this.config.enabled) return;

    this.metrics.cpuUsage.set(percentage);
  }

  updateMemoryUsage(bytes: number): void {
    if (!this.config.enabled) return;

    this.metrics.memoryUsage.set(bytes);
  }

  updateDiskUsage(mountPoint: string, bytes: number): void {
    if (!this.config.enabled) return;

    this.metrics.diskUsage.set({ mount_point: mountPoint }, bytes);
  }

  // Metrics collection methods
  async getMetrics(): Promise<string> {
    if (!this.config.enabled) {
      return '# Metrics disabled\n';
    }

    return await register.metrics();
  }

  async getBusinessMetrics(): Promise<BusinessMetrics> {
    // This would typically query your database or other services
    // For now, return current metric values
    return {
      users: {
        total: await this.metrics.usersTotal.get(),
        active: await this.metrics.activeUsers.get(),
        new: await this.metrics.newUsers.get(),
      },
      products: {
        total: await this.metrics.productsTotal.get(),
        active: await this.metrics.activeProducts.get(),
        lowStock: await this.metrics.lowStockProducts.get(),
      },
      orders: {
        total: await this.metrics.ordersTotal.get(),
        revenue: await this.metrics.orderRevenue.get(),
        pending: await this.metrics.pendingOrders.get(),
      },
      performance: {
        responseTime: 0, // Would calculate from histogram
        errorRate: 0, // Would calculate from counters
        throughput: 0, // Would calculate from counters
      },
    };
  }

  // Custom metrics
  createCounter(name: string, help: string, labelNames?: string[]): Counter<string> {
    if (!this.config.enabled) {
      throw new Error('Metrics are disabled');
    }

    const counter = new Counter({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
    });

    register.registerMetric(counter);
    return counter;
  }

  createHistogram(name: string, help: string, options?: { labelNames?: string[]; buckets?: number[] }): Histogram<string> {
    if (!this.config.enabled) {
      throw new Error('Metrics are disabled');
    }

    const histogram = new Histogram({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames: options?.labelNames,
      buckets: options?.buckets,
    });

    register.registerMetric(histogram);
    return histogram;
  }

  createGauge(name: string, help: string, labelNames?: string[]): Gauge<string> {
    if (!this.config.enabled) {
      throw new Error('Metrics are disabled');
    }

    const gauge = new Gauge({
      name: `${this.config.prefix}${name}`,
      help,
      labelNames,
    });

    register.registerMetric(gauge);
    return gauge;
  }

  // Health check for metrics
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; metrics: any }> {
    try {
      const metrics = await register.getMetricsAsJSON();
      
      return {
        status: 'healthy',
        metrics: {
          totalMetrics: metrics.length,
          enabled: this.config.enabled,
          prefix: this.config.prefix,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: {
          error: error.message,
          enabled: this.config.enabled,
        },
      };
    }
  }

  // Reset all metrics (useful for testing)
  reset(): void {
    if (!this.config.enabled) return;

    register.clear();
    this.initializeMetrics();
    this.setupDefaultMetrics();
  }

  // Enable/disable metrics
  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  // Get metric values for monitoring
  async getMetricValues(): Promise<Record<string, any>> {
    if (!this.config.enabled) {
      return {};
    }

    const metrics = await register.getMetricsAsJSON();
    const values: Record<string, any> = {};

    metrics.forEach(metric => {
      values[metric.name] = metric.values;
    });

    return values;
  }

  // Export metrics for external monitoring systems
  async exportForPrometheus(): Promise<string> {
    return this.getMetrics();
  }

  async exportForInfluxDB(): Promise<any[]> {
    const metrics = await this.getMetricValues();
    const points = [];

    for (const [name, data] of Object.entries(metrics)) {
      if (Array.isArray(data)) {
        data.forEach(point => {
          points.push({
            measurement: name,
            fields: { value: point.value },
            tags: point.labels || {},
            timestamp: new Date().getTime(),
          });
        });
      }
    }

    return points;
  }

  async exportForDatadog(): Promise<any[]> {
    const metrics = await this.getMetricValues();
    const series = [];

    for (const [name, data] of Object.entries(metrics)) {
      if (Array.isArray(data)) {
        data.forEach(point => {
          series.push({
            metric: name,
            points: [[new Date().getTime(), point.value]],
            tags: point.labels ? Object.entries(point.labels).map(([k, v]) => `${k}:${v}`) : [],
            type: 'gauge',
          });
        });
      }
    }

    return series;
  }
}
