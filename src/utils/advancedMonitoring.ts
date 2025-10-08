// Enhanced monitoring system for AdTopia revenue scaling
import { monitoring } from './monitoring';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  agencyRevenue: Record<string, number>;
  commissionRevenue: Record<string, number>;
  conversionRate: number;
  averageSaleValue: number;
}

interface AgencyMetrics {
  agencyId: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  salesCount: number;
  totalSales: number;
  commissionEarned: number;
  conversionRate: number;
  averageSaleValue: number;
  monthlyQuota: number;
  quotaProgress: number;
  lastActivity: Date;
  performance: {
    sales: number;
    commission: number;
    conversionRate: number;
    customerCount: number;
  };
}

interface SystemMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  activeUsers: number;
  concurrentSessions: number;
  systemUptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface BusinessMetrics {
  totalAgencies: number;
  activeAgencies: number;
  totalSales: number;
  totalCommissions: number;
  averageCommissionRate: number;
  topPerformers: Array<{
    agencyId: string;
    sales: number;
    commission: number;
  }>;
  revenueGrowth: number;
  customerAcquisition: number;
  churnRate: number;
}

export class AdvancedMonitoring {
  private static instance: AdvancedMonitoring;
  private metricsBuffer: Map<string, any> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  static getInstance(): AdvancedMonitoring {
    if (!AdvancedMonitoring.instance) {
      AdvancedMonitoring.instance = new AdvancedMonitoring();
    }
    return AdvancedMonitoring.instance;
  }

  constructor() {
    this.initializeAlertThresholds();
    this.startMetricsCollection();
  }

  // Initialize alert thresholds
  private initializeAlertThresholds() {
    this.alertThresholds.set('api_response_time', 1000); // 1 second
    this.alertThresholds.set('database_query_time', 500); // 500ms
    this.alertThresholds.set('error_rate', 0.05); // 5%
    this.alertThresholds.set('cache_hit_rate', 0.8); // 80%
    this.alertThresholds.set('memory_usage', 0.9); // 90%
    this.alertThresholds.set('cpu_usage', 0.8); // 80%
  }

  // Start continuous metrics collection
  private startMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Collect business metrics every 5 minutes
    setInterval(() => {
      this.collectBusinessMetrics();
    }, 300000);

    // Flush metrics buffer every minute
    setInterval(() => {
      this.flushMetricsBuffer();
    }, 60000);
  }

  // Revenue tracking with detailed analytics
  async trackRevenueMetrics(metrics: RevenueMetrics): Promise<void> {
    try {
      // Track overall revenue metrics
      monitoring.trackBusinessMetric('total_revenue', metrics.totalRevenue);
      monitoring.trackBusinessMetric('monthly_revenue', metrics.monthlyRevenue);
      monitoring.trackBusinessMetric('daily_revenue', metrics.dailyRevenue);
      monitoring.trackBusinessMetric('conversion_rate', metrics.conversionRate);
      monitoring.trackBusinessMetric('avg_sale_value', metrics.averageSaleValue);

      // Track agency-specific revenue
      for (const [agencyId, revenue] of Object.entries(metrics.agencyRevenue)) {
        monitoring.trackRevenue(agencyId, revenue, 'sale');
      }

      // Track commission revenue
      for (const [agencyId, commission] of Object.entries(metrics.commissionRevenue)) {
        monitoring.trackRevenue(agencyId, commission, 'commission');
      }

      // Store in metrics buffer for aggregation
      this.metricsBuffer.set('revenue_metrics', {
        ...metrics,
        timestamp: Date.now(),
      });

      console.log('✅ Revenue metrics tracked successfully');
    } catch (error) {
      console.error('❌ Failed to track revenue metrics:', error);
      monitoring.trackError(error as Error, { metrics });
    }
  }

  // Agency performance tracking with tier-based analytics
  async trackAgencyMetrics(metrics: AgencyMetrics): Promise<void> {
    try {
      // Track agency performance
      monitoring.trackAgencyPerformance(metrics.agencyId, {
        salesCount: metrics.salesCount,
        conversionRate: metrics.conversionRate,
        avgSaleValue: metrics.averageSaleValue,
      });

      // Track tier-specific metrics
      monitoring.trackBusinessMetric('agency_tier_performance', metrics.commissionEarned, [
        `tier:${metrics.tier}`,
        `agency:${metrics.agencyId}`,
      ]);

      // Track quota progress
      monitoring.trackBusinessMetric('quota_progress', metrics.quotaProgress, [
        `agency:${metrics.agencyId}`,
        `tier:${metrics.tier}`,
      ]);

      // Track performance metrics
      monitoring.trackBusinessMetric('agency_performance', metrics.performance.sales, [
        `agency:${metrics.agencyId}`,
        `metric:sales`,
      ]);

      // Store in metrics buffer
      this.metricsBuffer.set(`agency_${metrics.agencyId}`, {
        ...metrics,
        timestamp: Date.now(),
      });

      console.log(`✅ Agency metrics tracked for ${metrics.agencyId}`);
    } catch (error) {
      console.error(`❌ Failed to track agency metrics for ${metrics.agencyId}:`, error);
      monitoring.trackError(error as Error, { agencyId: metrics.agencyId, metrics });
    }
  }

  // System performance monitoring
  async trackSystemMetrics(metrics: SystemMetrics): Promise<void> {
    try {
      // Track API performance
      monitoring.trackAPICall('system_metrics', metrics.apiResponseTime, 200);
      monitoring.trackBusinessMetric('api_response_time', metrics.apiResponseTime);

      // Track database performance
      monitoring.trackDatabaseQuery('system_metrics', metrics.databaseQueryTime);
      monitoring.trackBusinessMetric('database_query_time', metrics.databaseQueryTime);

      // Track cache performance
      monitoring.trackBusinessMetric('cache_hit_rate', metrics.cacheHitRate);

      // Track error rate
      monitoring.trackBusinessMetric('error_rate', metrics.errorRate);

      // Track system resources
      monitoring.trackBusinessMetric('memory_usage', metrics.memoryUsage);
      monitoring.trackBusinessMetric('cpu_usage', metrics.cpuUsage);

      // Track user metrics
      monitoring.trackBusinessMetric('active_users', metrics.activeUsers);
      monitoring.trackBusinessMetric('concurrent_sessions', metrics.concurrentSessions);

      // Check alert thresholds
      this.checkAlertThresholds(metrics);

      // Store in metrics buffer
      this.metricsBuffer.set('system_metrics', {
        ...metrics,
        timestamp: Date.now(),
      });

      console.log('✅ System metrics tracked successfully');
    } catch (error) {
      console.error('❌ Failed to track system metrics:', error);
      monitoring.trackError(error as Error, { metrics });
    }
  }

  // Business metrics tracking
  async trackBusinessMetrics(metrics: BusinessMetrics): Promise<void> {
    try {
      // Track agency metrics
      monitoring.trackBusinessMetric('total_agencies', metrics.totalAgencies);
      monitoring.trackBusinessMetric('active_agencies', metrics.activeAgencies);

      // Track sales metrics
      monitoring.trackBusinessMetric('total_sales', metrics.totalSales);
      monitoring.trackBusinessMetric('total_commissions', metrics.totalCommissions);
      monitoring.trackBusinessMetric('avg_commission_rate', metrics.averageCommissionRate);

      // Track growth metrics
      monitoring.trackBusinessMetric('revenue_growth', metrics.revenueGrowth);
      monitoring.trackBusinessMetric('customer_acquisition', metrics.customerAcquisition);
      monitoring.trackBusinessMetric('churn_rate', metrics.churnRate);

      // Track top performers
      for (const performer of metrics.topPerformers) {
        monitoring.trackBusinessMetric('top_performer_sales', performer.sales, [
          `agency:${performer.agencyId}`,
        ]);
        monitoring.trackBusinessMetric('top_performer_commission', performer.commission, [
          `agency:${performer.agencyId}`,
        ]);
      }

      // Store in metrics buffer
      this.metricsBuffer.set('business_metrics', {
        ...metrics,
        timestamp: Date.now(),
      });

      console.log('✅ Business metrics tracked successfully');
    } catch (error) {
      console.error('❌ Failed to track business metrics:', error);
      monitoring.trackError(error as Error, { metrics });
    }
  }

  // Check alert thresholds and trigger alerts
  private checkAlertThresholds(metrics: SystemMetrics): void {
    const alerts: string[] = [];

    if (metrics.apiResponseTime > this.alertThresholds.get('api_response_time')!) {
      alerts.push(`High API response time: ${metrics.apiResponseTime}ms`);
    }

    if (metrics.databaseQueryTime > this.alertThresholds.get('database_query_time')!) {
      alerts.push(`High database query time: ${metrics.databaseQueryTime}ms`);
    }

    if (metrics.errorRate > this.alertThresholds.get('error_rate')!) {
      alerts.push(`High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    }

    if (metrics.cacheHitRate < this.alertThresholds.get('cache_hit_rate')!) {
      alerts.push(`Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%`);
    }

    if (metrics.memoryUsage > this.alertThresholds.get('memory_usage')!) {
      alerts.push(`High memory usage: ${(metrics.memoryUsage * 100).toFixed(2)}%`);
    }

    if (metrics.cpuUsage > this.alertThresholds.get('cpu_usage')!) {
      alerts.push(`High CPU usage: ${(metrics.cpuUsage * 100).toFixed(2)}%`);
    }

    // Send alerts if any thresholds are exceeded
    if (alerts.length > 0) {
      this.sendAlerts(alerts);
    }
  }

  // Send alerts to monitoring system
  private sendAlerts(alerts: string[]): void {
    for (const alert of alerts) {
      console.warn(`🚨 ALERT: ${alert}`);
      monitoring.trackBusinessMetric('alert_count', 1, [`alert:${alert}`]);
    }
  }

  // Collect system metrics
  private async collectSystemMetrics(): Promise<void> {
    try {
      const systemMetrics: SystemMetrics = {
        apiResponseTime: this.getAverageApiResponseTime(),
        databaseQueryTime: this.getAverageDatabaseQueryTime(),
        cacheHitRate: this.getCacheHitRate(),
        errorRate: this.getErrorRate(),
        activeUsers: this.getActiveUserCount(),
        concurrentSessions: this.getConcurrentSessionCount(),
        systemUptime: this.getSystemUptime(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
      };

      await this.trackSystemMetrics(systemMetrics);
    } catch (error) {
      console.error('❌ Failed to collect system metrics:', error);
    }
  }

  // Collect business metrics
  private async collectBusinessMetrics(): Promise<void> {
    try {
      const businessMetrics: BusinessMetrics = {
        totalAgencies: this.getTotalAgencyCount(),
        activeAgencies: this.getActiveAgencyCount(),
        totalSales: this.getTotalSales(),
        totalCommissions: this.getTotalCommissions(),
        averageCommissionRate: this.getAverageCommissionRate(),
        topPerformers: this.getTopPerformers(),
        revenueGrowth: this.getRevenueGrowth(),
        customerAcquisition: this.getCustomerAcquisition(),
        churnRate: this.getChurnRate(),
      };

      await this.trackBusinessMetrics(businessMetrics);
    } catch (error) {
      console.error('❌ Failed to collect business metrics:', error);
    }
  }

  // Flush metrics buffer
  private flushMetricsBuffer(): void {
    try {
      const metrics = Array.from(this.metricsBuffer.entries());
      console.log(`📊 Flushing ${metrics.length} metrics from buffer`);
      
      // Here you would typically send metrics to external monitoring service
      // For now, we'll just log the metrics
      for (const [key, value] of metrics) {
        console.log(`📈 Metric: ${key}`, value);
      }

      // Clear the buffer
      this.metricsBuffer.clear();
    } catch (error) {
      console.error('❌ Failed to flush metrics buffer:', error);
    }
  }

  // Helper methods for metric collection (implement based on your system)
  private getAverageApiResponseTime(): number {
    // Implement based on your API monitoring
    return Math.random() * 200; // Placeholder
  }

  private getAverageDatabaseQueryTime(): number {
    // Implement based on your database monitoring
    return Math.random() * 100; // Placeholder
  }

  private getCacheHitRate(): number {
    // Implement based on your cache monitoring
    return 0.85 + Math.random() * 0.1; // Placeholder
  }

  private getErrorRate(): number {
    // Implement based on your error tracking
    return Math.random() * 0.02; // Placeholder
  }

  private getActiveUserCount(): number {
    // Implement based on your user tracking
    return Math.floor(Math.random() * 1000) + 100; // Placeholder
  }

  private getConcurrentSessionCount(): number {
    // Implement based on your session tracking
    return Math.floor(Math.random() * 500) + 50; // Placeholder
  }

  private getSystemUptime(): number {
    // Implement based on your system monitoring
    return Date.now() - (Date.now() - 86400000); // Placeholder
  }

  private getMemoryUsage(): number {
    // Implement based on your system monitoring
    return 0.6 + Math.random() * 0.3; // Placeholder
  }

  private getCpuUsage(): number {
    // Implement based on your system monitoring
    return 0.4 + Math.random() * 0.4; // Placeholder
  }

  private getTotalAgencyCount(): number {
    // Implement based on your database
    return 150; // Placeholder
  }

  private getActiveAgencyCount(): number {
    // Implement based on your database
    return 120; // Placeholder
  }

  private getTotalSales(): number {
    // Implement based on your database
    return 50000; // Placeholder
  }

  private getTotalCommissions(): number {
    // Implement based on your database
    return 7500; // Placeholder
  }

  private getAverageCommissionRate(): number {
    // Implement based on your database
    return 0.15; // Placeholder
  }

  private getTopPerformers(): Array<{ agencyId: string; sales: number; commission: number }> {
    // Implement based on your database
    return [
      { agencyId: 'agency_1', sales: 10000, commission: 1500 },
      { agencyId: 'agency_2', sales: 8000, commission: 1200 },
      { agencyId: 'agency_3', sales: 6000, commission: 900 },
    ];
  }

  private getRevenueGrowth(): number {
    // Implement based on your analytics
    return 0.25; // Placeholder
  }

  private getCustomerAcquisition(): number {
    // Implement based on your analytics
    return 50; // Placeholder
  }

  private getChurnRate(): number {
    // Implement based on your analytics
    return 0.05; // Placeholder
  }

  // Get metrics summary
  getMetricsSummary(): any {
    return {
      bufferSize: this.metricsBuffer.size,
      alertThresholds: Object.fromEntries(this.alertThresholds),
      lastFlush: new Date().toISOString(),
      service: 'adtopia-revenue-system',
      environment: process.env.NODE_ENV || 'production',
    };
  }
}

// Export singleton instance
export const advancedMonitoring = AdvancedMonitoring.getInstance();
