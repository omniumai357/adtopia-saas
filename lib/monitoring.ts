import { cache } from './redis';

// Performance monitoring and metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private startTime: number = Date.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track API response time
  async trackApiResponse(endpoint: string, method: string, duration: number, statusCode: number) {
    const key = `metrics:api:${method}:${endpoint}`;
    const timestamp = Date.now();
    
    const metric = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp,
      success: statusCode < 400,
    };

    // Store in Redis for aggregation
    await cache.set(`${key}:${timestamp}`, metric, 86400); // 24 hours

    // Update real-time metrics
    this.updateMetric(`api.${method}.${endpoint}.response_time`, duration);
    this.updateMetric(`api.${method}.${endpoint}.requests`, 1);
    this.updateMetric(`api.${method}.${endpoint}.success_rate`, statusCode < 400 ? 1 : 0);
  }

  // Track database query performance
  async trackDatabaseQuery(query: string, duration: number, rowsAffected: number) {
    const key = `metrics:db:${this.hashQuery(query)}`;
    const timestamp = Date.now();
    
    const metric = {
      query: this.sanitizeQuery(query),
      duration,
      rowsAffected,
      timestamp,
    };

    await cache.set(`${key}:${timestamp}`, metric, 86400);

    this.updateMetric('db.query.response_time', duration);
    this.updateMetric('db.query.count', 1);
    this.updateMetric('db.query.rows_affected', rowsAffected);
  }

  // Track user session metrics
  async trackUserSession(userId: string, action: string, metadata: any = {}) {
    const key = `metrics:user:${userId}`;
    const timestamp = Date.now();
    
    const metric = {
      userId,
      action,
      metadata,
      timestamp,
    };

    await cache.set(`${key}:${action}:${timestamp}`, metric, 86400);

    this.updateMetric(`user.${action}.count`, 1);
    this.updateMetric('user.active_sessions', 1);
  }

  // Track cache performance
  async trackCacheHit(key: string, hit: boolean, duration: number) {
    const metric = {
      key: this.sanitizeKey(key),
      hit,
      duration,
      timestamp: Date.now(),
    };

    await cache.set(`metrics:cache:${Date.now()}`, metric, 86400);

    this.updateMetric('cache.hit_rate', hit ? 1 : 0);
    this.updateMetric('cache.response_time', duration);
  }

  // Track error occurrences
  async trackError(error: Error, context: any = {}) {
    const key = `metrics:error:${error.name}`;
    const timestamp = Date.now();
    
    const metric = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp,
    };

    await cache.set(`${key}:${timestamp}`, metric, 86400);

    this.updateMetric(`error.${error.name}.count`, 1);
    this.updateMetric('error.total_count', 1);
  }

  // Update metric value
  private updateMetric(key: string, value: number) {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    return {
      uptime,
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
    };
  }

  // Get aggregated metrics from Redis
  async getAggregatedMetrics(timeWindow: number = 3600000) { // 1 hour default
    const now = Date.now();
    const startTime = now - timeWindow;
    
    try {
      // Get API metrics
      const apiKeys = await cache.redis?.keys('metrics:api:*') || [];
      const apiMetrics = await this.aggregateMetrics(apiKeys, startTime);
      
      // Get database metrics
      const dbKeys = await cache.redis?.keys('metrics:db:*') || [];
      const dbMetrics = await this.aggregateMetrics(dbKeys, startTime);
      
      // Get error metrics
      const errorKeys = await cache.redis?.keys('metrics:error:*') || [];
      const errorMetrics = await this.aggregateMetrics(errorKeys, startTime);
      
      return {
        timeWindow,
        startTime,
        endTime: now,
        api: apiMetrics,
        database: dbMetrics,
        errors: errorMetrics,
        summary: this.generateSummary(apiMetrics, dbMetrics, errorMetrics),
      };
    } catch (error) {
      console.error('Error getting aggregated metrics:', error);
      return null;
    }
  }

  // Aggregate metrics from Redis keys
  private async aggregateMetrics(keys: string[], startTime: number) {
    const metrics: any = {};
    
    for (const key of keys) {
      const timestamp = parseInt(key.split(':').pop() || '0');
      if (timestamp >= startTime) {
        const metric = await cache.get(key);
        if (metric) {
          const category = key.split(':')[1];
          if (!metrics[category]) {
            metrics[category] = [];
          }
          metrics[category].push(metric);
        }
      }
    }
    
    return metrics;
  }

  // Generate performance summary
  private generateSummary(apiMetrics: any, dbMetrics: any, errorMetrics: any) {
    const summary = {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      databaseQueries: 0,
      averageQueryTime: 0,
    };

    // Calculate API summary
    if (apiMetrics.api) {
      const requests = apiMetrics.api.length;
      const totalDuration = apiMetrics.api.reduce((sum: number, req: any) => sum + req.duration, 0);
      const errors = apiMetrics.api.filter((req: any) => !req.success).length;
      
      summary.totalRequests = requests;
      summary.averageResponseTime = requests > 0 ? totalDuration / requests : 0;
      summary.errorRate = requests > 0 ? (errors / requests) * 100 : 0;
    }

    // Calculate database summary
    if (dbMetrics.db) {
      const queries = dbMetrics.db.length;
      const totalDuration = dbMetrics.db.reduce((sum: number, query: any) => sum + query.duration, 0);
      
      summary.databaseQueries = queries;
      summary.averageQueryTime = queries > 0 ? totalDuration / queries : 0;
    }

    return summary;
  }

  // Sanitize query for logging
  private sanitizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/'.*?'/g, "'***'")
      .replace(/".*?"/g, '"***"')
      .substring(0, 200);
  }

  // Sanitize cache key for logging
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9:._-]/g, '*');
  }

  // Hash query for consistent key generation
  private hashQuery(query: string): string {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Health check monitoring
export class HealthMonitor {
  private static instance: HealthMonitor;
  private checks: Map<string, () => Promise<boolean>> = new Map();

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  // Register health check
  registerCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn);
  }

  // Run all health checks
  async runHealthChecks() {
    const results: any = {};
    const startTime = Date.now();

    for (const [name, checkFn] of this.checks) {
      try {
        const checkStart = Date.now();
        const isHealthy = await Promise.race([
          checkFn(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        const duration = Date.now() - checkStart;
        
        results[name] = {
          healthy: isHealthy,
          duration,
          timestamp: Date.now(),
        };
      } catch (error) {
        results[name] = {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        };
      }
    }

    const overallHealth = Object.values(results).every((result: any) => result.healthy);
    
    return {
      healthy: overallHealth,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      checks: results,
    };
  }
}

// Initialize monitoring
const performanceMonitor = PerformanceMonitor.getInstance();
const healthMonitor = HealthMonitor.getInstance();

// Register default health checks
healthMonitor.registerCheck('database', async () => {
  // Add database connectivity check
  return true; // Placeholder
});

healthMonitor.registerCheck('redis', async () => {
  // Add Redis connectivity check
  return true; // Placeholder
});

healthMonitor.registerCheck('api', async () => {
  // Add API endpoint check
  return true; // Placeholder
});

export { performanceMonitor, healthMonitor };
