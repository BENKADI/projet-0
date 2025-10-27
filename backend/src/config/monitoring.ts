import { MetricsService } from '../infrastructure/monitoring/MetricsService';
import { createMonitoringMiddleware, setupAdvancedMonitoring } from '../shared/middleware/MonitoringMiddleware';

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    enabled: boolean;
    prefix: string;
    labels: Record<string, string>;
  };
  tracing: {
    enabled: boolean;
    serviceName: string;
    samplingRate: number;
    endpoint?: string;
  };
  logging: {
    level: string;
    format: string;
    includeMetrics: boolean;
  };
  alerts: {
    enabled: boolean;
    thresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    webhook?: string;
  };
}

export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: process.env.NODE_ENV !== 'test',
  metrics: {
    enabled: true,
    prefix: 'projet0_',
    labels: {
      service: 'projet-0-api',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  },
  tracing: {
    enabled: process.env.NODE_ENV === 'production',
    serviceName: 'projet-0-api',
    samplingRate: 0.1, // 10% sampling
    endpoint: process.env.JAEGER_ENDPOINT,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    includeMetrics: true,
  },
  alerts: {
    enabled: process.env.NODE_ENV === 'production',
    thresholds: {
      responseTime: 5000, // 5 seconds
      errorRate: 5, // 5%
      memoryUsage: 80, // 80%
      cpuUsage: 80, // 80%
    },
    webhook: process.env.ALERT_WEBHOOK_URL,
  },
};

export class MonitoringManager {
  private metricsService: MetricsService;
  private config: MonitoringConfig;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...defaultMonitoringConfig, ...config };
    this.metricsService = new MetricsService(this.config.metrics);
  }

  getMetricsService(): MetricsService {
    return this.metricsService;
  }

  getMiddleware() {
    if (!this.config.enabled) {
      return [];
    }

    return setupAdvancedMonitoring(this.metricsService);
  }

  getHealthCheckMiddleware() {
    const monitoring = createMonitoringMiddleware(this.metricsService);
    return monitoring.healthCheck();
  }

  getMetricsEndpointMiddleware() {
    const monitoring = createMonitoringMiddleware(this.metricsService);
    return monitoring.metricsEndpoint();
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Monitoring is disabled');
      return;
    }

    console.log('Initializing monitoring with config:', {
      enabled: this.config.enabled,
      metrics: this.config.metrics.enabled,
      tracing: this.config.tracing.enabled,
      alerts: this.config.alerts.enabled,
    });

    // Initialize metrics
    if (this.config.metrics.enabled) {
      console.log('Metrics service initialized');
    }

    // Initialize tracing
    if (this.config.tracing.enabled) {
      await this.initializeTracing();
    }

    // Initialize alerts
    if (this.config.alerts.enabled) {
      await this.initializeAlerts();
    }

    // Setup system metrics collection
    this.setupSystemMetricsCollection();
  }

  private async initializeTracing(): Promise<void> {
    // This would initialize Jaeger or other tracing service
    console.log('Tracing initialized');
  }

  private async initializeAlerts(): Promise<void> {
    // This would initialize alerting system
    console.log('Alert system initialized');
  }

  private setupSystemMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        console.error('Failed to collect system metrics:', error);
      }
    }, 30000);
  }

  private async collectSystemMetrics(): Promise<void> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Update memory metrics
    this.metricsService.updateMemoryUsage(memUsage.heapUsed);

    // Update CPU metrics (simplified)
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
    this.metricsService.updateCpuUsage(cpuPercent);

    // Check alert thresholds
    await this.checkAlertThresholds(memUsage, cpuPercent);
  }

  private async checkAlertThresholds(memUsage: NodeJS.MemoryUsage, cpuPercent: number): Promise<void> {
    const { thresholds } = this.config.alerts;
    const totalMem = memUsage.heapTotal;
    const usedMemPercent = (memUsage.heapUsed / totalMem) * 100;

    // Memory usage alert
    if (usedMemPercent > thresholds.memoryUsage) {
      await this.sendAlert('high_memory_usage', {
        current: usedMemPercent,
        threshold: thresholds.memoryUsage,
        heapUsed: memUsage.heapUsed,
        heapTotal: totalMem,
      });
    }

    // CPU usage alert
    if (cpuPercent > thresholds.cpuUsage) {
      await this.sendAlert('high_cpu_usage', {
        current: cpuPercent,
        threshold: thresholds.cpuUsage,
      });
    }
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    if (!this.config.alerts.webhook) {
      return;
    }

    try {
      const alert = {
        type,
        timestamp: new Date().toISOString(),
        service: this.config.metrics.labels.service,
        environment: this.config.metrics.labels.environment,
        data,
      };

      // Send webhook notification
      await fetch(this.config.alerts.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });

      console.log(`Alert sent: ${type}`, data);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down monitoring...');
    
    // Cleanup resources
    this.metricsService.reset();
    
    console.log('Monitoring shutdown complete');
  }
}

// Singleton instance
let monitoringManager: MonitoringManager | null = null;

export function getMonitoringManager(): MonitoringManager {
  if (!monitoringManager) {
    monitoringManager = new MonitoringManager();
  }
  return monitoringManager;
}

export function initializeMonitoring(config?: Partial<MonitoringConfig>): MonitoringManager {
  monitoringManager = new MonitoringManager(config);
  return monitoringManager;
}

// Environment-based configuration
export function createMonitoringConfigFromEnv(): MonitoringConfig {
  return {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      prefix: process.env.METRICS_PREFIX || 'projet0_',
      labels: {
        service: process.env.SERVICE_NAME || 'projet-0-api',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        region: process.env.AWS_REGION || process.env.REGION || 'local',
      },
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      serviceName: process.env.SERVICE_NAME || 'projet-0-api',
      samplingRate: parseFloat(process.env.TRACING_SAMPLING_RATE || '0.1'),
      endpoint: process.env.JAEGER_ENDPOINT,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      includeMetrics: process.env.LOG_INCLUDE_METRICS !== 'false',
    },
    alerts: {
      enabled: process.env.ALERTS_ENABLED === 'true',
      thresholds: {
        responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD || '5000'),
        errorRate: parseFloat(process.env.ALERT_ERROR_RATE_THRESHOLD || '5'),
        memoryUsage: parseFloat(process.env.ALERT_MEMORY_THRESHOLD || '80'),
        cpuUsage: parseFloat(process.env.ALERT_CPU_THRESHOLD || '80'),
      },
      webhook: process.env.ALERT_WEBHOOK_URL,
    },
  };
}

// Docker Compose configuration for monitoring stack
export const dockerComposeMonitoring = `
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  prometheus-data:
  grafana-data:
  redis-data:
`;

// Prometheus configuration
export const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'projet-0-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093
`;

// Grafana dashboard configuration
export const grafanaDashboardConfig = {
  dashboard: {
    title: 'Projet-0 API Dashboard',
    tags: ['projet-0', 'api'],
    timezone: 'browser',
    panels: [
      {
        title: 'HTTP Requests',
        type: 'graph',
        targets: [
          {
            expr: 'rate(projet0_http_requests_total[5m])',
            legendFormat: '{{method}} {{route}}',
          },
        ],
      },
      {
        title: 'Response Time',
        type: 'graph',
        targets: [
          {
            expr: 'histogram_quantile(0.95, rate(projet0_http_request_duration_seconds_bucket[5m]))',
            legendFormat: '95th percentile',
          },
        ],
      },
      {
        title: 'Error Rate',
        type: 'singlestat',
        targets: [
          {
            expr: 'rate(projet0_http_requests_total{status_code=~"5.."}[5m]) / rate(projet0_http_requests_total[5m]) * 100',
            legendFormat: 'Error Rate %',
          },
        ],
      },
      {
        title: 'Active Users',
        type: 'singlestat',
        targets: [
          {
            expr: 'projet0_active_users_total',
            legendFormat: 'Active Users',
          },
        ],
      },
    ],
  },
};
