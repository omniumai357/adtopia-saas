// Create: src/utils/monitoring.ts
// Comprehensive application performance monitoring

import { StatsD } from 'node-statsd';

interface MonitoringConfig {
  apiKey: string;
  service: string;
  environment: string;
}

export class AdTopiaMonitoring {
  private statsd: StatsD;
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.statsd = new StatsD({
      host: 'localhost',
      port: 8125,
      prefix: 'adtopia.'
    });
  }

  // Revenue metrics tracking
  trackRevenue(agencyId: string, amount: number, type: 'sale' | 'commission') {
    this.statsd.gauge(`revenue.${type}`, amount, [`agency:${agencyId}`]);
  }

  // Agency performance metrics
  trackAgencyPerformance(agencyId: string, metrics: {
    salesCount: number;
    conversionRate: number;
    avgSaleValue: number;
  }) {
    const tags = [`agency:${agencyId}`];
    this.statsd.gauge('agency.sales_count', metrics.salesCount, tags);
    this.statsd.gauge('agency.conversion_rate', metrics.conversionRate, tags);
    this.statsd.gauge('agency.avg_sale_value', metrics.avgSaleValue, tags);
  }

  // API performance tracking
  trackAPICall(endpoint: string, duration: number, status: number) {
    const tags = [`endpoint:${endpoint}`, `status:${status}`];
    this.statsd.timing('api.response_time', duration, tags);
    this.statsd.increment('api.requests', 1, tags);
  }

  // Database performance monitoring
  trackDatabaseQuery(query: string, duration: number) {
    this.statsd.timing('database.query_time', duration, [`query:${query}`]);
  }

  // Error tracking
  trackError(error: Error, context: Record<string, any> = {}) {
    this.statsd.increment('errors.count', 1, [
      `error_type:${error.name}`,
      `service:${this.config.service}`
    ]);
    
    // Send to DataDog
    console.error('AdTopia Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Custom business metrics
  trackBusinessMetric(name: string, value: number, tags: string[] = []) {
    this.statsd.gauge(`business.${name}`, value, tags);
  }
}

export const monitoring = new AdTopiaMonitoring({
  apiKey: process.env.DATADOG_API_KEY!,
  service: 'adtopia-revenue-system',
  environment: process.env.NODE_ENV || 'production'
});
