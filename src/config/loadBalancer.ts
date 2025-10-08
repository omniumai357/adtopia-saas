// Advanced load balancing configuration for AdTopia revenue scaling
import { monitoring } from '../utils/monitoring';

interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted-round-robin';
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
    retries: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
  };
  stickySessions: {
    enabled: boolean;
    cookieName: string;
    maxAge: number;
  };
  failover: {
    enabled: boolean;
    maxFailures: number;
    recoveryTime: number;
  };
  metrics: {
    enabled: boolean;
    collectionInterval: number;
    retentionDays: number;
  };
}

interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  status: 'healthy' | 'unhealthy' | 'maintenance';
  lastHealthCheck: Date;
  responseTime: number;
  errorCount: number;
  requestCount: number;
}

export class LoadBalancer {
  private static instance: LoadBalancer;
  private config: LoadBalancerConfig;
  private servers: Map<string, ServerInstance> = new Map();
  private currentIndex: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics: Map<string, any> = new Map();

  static getInstance(): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer();
    }
    return LoadBalancer.instance;
  }

  constructor() {
    this.config = {
      algorithm: 'least-connections',
      healthCheck: {
        path: '/health',
        interval: 30000, // 30 seconds
        timeout: 5000,   // 5 seconds
        retries: 3,
        healthyThreshold: 2,
        unhealthyThreshold: 3,
      },
      stickySessions: {
        enabled: true,
        cookieName: 'adtopia-session',
        maxAge: 1800000, // 30 minutes
      },
      failover: {
        enabled: true,
        maxFailures: 5,
        recoveryTime: 300000, // 5 minutes
      },
      metrics: {
        enabled: true,
        collectionInterval: 60000, // 1 minute
        retentionDays: 7,
      },
    };

    this.initializeServers();
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  // Initialize server instances
  private initializeServers(): void {
    const serverConfigs = [
      { id: 'server-1', host: 'localhost', port: 3001, weight: 1 },
      { id: 'server-2', host: 'localhost', port: 3002, weight: 1 },
      { id: 'server-3', host: 'localhost', port: 3003, weight: 1 },
    ];

    for (const config of serverConfigs) {
      this.servers.set(config.id, {
        ...config,
        status: 'healthy',
        lastHealthCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        requestCount: 0,
      });
    }

    console.log(`🚀 Load balancer initialized with ${this.servers.size} servers`);
  }

  // Start health checks
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheck.interval);

    console.log('🏥 Health checks started');
  }

  // Perform health checks on all servers
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.servers.values()).map(server => 
      this.checkServerHealth(server)
    );

    try {
      await Promise.allSettled(healthCheckPromises);
    } catch (error) {
      console.error('❌ Health check error:', error);
      monitoring.trackError(error as Error, { context: 'loadBalancerHealthCheck' });
    }
  }

  // Check individual server health
  private async checkServerHealth(server: ServerInstance): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://${server.host}:${server.port}${this.config.healthCheck.path}`, {
        method: 'GET',
        timeout: this.config.healthCheck.timeout,
      });

      const responseTime = Date.now() - startTime;
      server.responseTime = responseTime;
      server.lastHealthCheck = new Date();

      if (response.ok) {
        if (server.status === 'unhealthy') {
          console.log(`✅ Server ${server.id} recovered`);
        }
        server.status = 'healthy';
        server.errorCount = 0;
      } else {
        server.errorCount++;
        if (server.errorCount >= this.config.healthCheck.unhealthyThreshold) {
          server.status = 'unhealthy';
          console.log(`❌ Server ${server.id} marked as unhealthy`);
        }
      }
    } catch (error) {
      server.errorCount++;
      server.responseTime = this.config.healthCheck.timeout;
      
      if (server.errorCount >= this.config.healthCheck.unhealthyThreshold) {
        server.status = 'unhealthy';
        console.log(`❌ Server ${server.id} marked as unhealthy: ${error.message}`);
      }
    }
  }

  // Start metrics collection
  private startMetricsCollection(): void {
    if (!this.config.metrics.enabled) return;

    setInterval(() => {
      this.collectMetrics();
    }, this.config.metrics.collectionInterval);

    console.log('📊 Metrics collection started');
  }

  // Collect load balancer metrics
  private collectMetrics(): void {
    const metrics = {
      timestamp: new Date().toISOString(),
      totalServers: this.servers.size,
      healthyServers: Array.from(this.servers.values()).filter(s => s.status === 'healthy').length,
      unhealthyServers: Array.from(this.servers.values()).filter(s => s.status === 'unhealthy').length,
      totalRequests: Array.from(this.servers.values()).reduce((sum, s) => sum + s.requestCount, 0),
      averageResponseTime: this.calculateAverageResponseTime(),
      errorRate: this.calculateErrorRate(),
      algorithm: this.config.algorithm,
    };

    this.metrics.set(Date.now().toString(), metrics);

    // Track in monitoring system
    monitoring.trackBusinessMetric('load_balancer_healthy_servers', metrics.healthyServers);
    monitoring.trackBusinessMetric('load_balancer_total_requests', metrics.totalRequests);
    monitoring.trackBusinessMetric('load_balancer_avg_response_time', metrics.averageResponseTime);
    monitoring.trackBusinessMetric('load_balancer_error_rate', metrics.errorRate);

    // Clean up old metrics
    this.cleanupMetrics();
  }

  // Calculate average response time
  private calculateAverageResponseTime(): number {
    const healthyServers = Array.from(this.servers.values()).filter(s => s.status === 'healthy');
    if (healthyServers.length === 0) return 0;
    
    const totalResponseTime = healthyServers.reduce((sum, s) => sum + s.responseTime, 0);
    return totalResponseTime / healthyServers.length;
  }

  // Calculate error rate
  private calculateErrorRate(): number {
    const totalRequests = Array.from(this.servers.values()).reduce((sum, s) => sum + s.requestCount, 0);
    const totalErrors = Array.from(this.servers.values()).reduce((sum, s) => sum + s.errorCount, 0);
    
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  // Clean up old metrics
  private cleanupMetrics(): void {
    const cutoffTime = Date.now() - (this.config.metrics.retentionDays * 24 * 60 * 60 * 1000);
    
    for (const [timestamp, _] of this.metrics) {
      if (parseInt(timestamp) < cutoffTime) {
        this.metrics.delete(timestamp);
      }
    }
  }

  // Select server based on algorithm
  selectServer(): ServerInstance | null {
    const healthyServers = Array.from(this.servers.values()).filter(s => s.status === 'healthy');
    
    if (healthyServers.length === 0) {
      console.warn('⚠️ No healthy servers available');
      return null;
    }

    switch (this.config.algorithm) {
      case 'round-robin':
        return this.roundRobinSelection(healthyServers);
      case 'least-connections':
        return this.leastConnectionsSelection(healthyServers);
      case 'ip-hash':
        return this.ipHashSelection(healthyServers);
      case 'weighted-round-robin':
        return this.weightedRoundRobinSelection(healthyServers);
      default:
        return this.roundRobinSelection(healthyServers);
    }
  }

  // Round-robin selection
  private roundRobinSelection(servers: ServerInstance[]): ServerInstance {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return server;
  }

  // Least connections selection
  private leastConnectionsSelection(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((min, server) => 
      server.requestCount < min.requestCount ? server : min
    );
  }

  // IP hash selection
  private ipHashSelection(servers: ServerInstance[]): ServerInstance {
    // This would typically use the client IP, but for demo purposes we'll use a random hash
    const hash = Math.random().toString(36).substring(7);
    const index = hash.charCodeAt(0) % servers.length;
    return servers[index];
  }

  // Weighted round-robin selection
  private weightedRoundRobinSelection(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return servers[0]; // Fallback
  }

  // Record request to server
  recordRequest(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.requestCount++;
    }
  }

  // Record error for server
  recordError(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.errorCount++;
    }
  }

  // Get server by ID
  getServer(serverId: string): ServerInstance | undefined {
    return this.servers.get(serverId);
  }

  // Get all servers
  getAllServers(): ServerInstance[] {
    return Array.from(this.servers.values());
  }

  // Get healthy servers
  getHealthyServers(): ServerInstance[] {
    return Array.from(this.servers.values()).filter(s => s.status === 'healthy');
  }

  // Get load balancer status
  getStatus(): any {
    return {
      config: this.config,
      servers: Array.from(this.servers.values()),
      metrics: {
        totalServers: this.servers.size,
        healthyServers: this.getHealthyServers().length,
        unhealthyServers: Array.from(this.servers.values()).filter(s => s.status === 'unhealthy').length,
        averageResponseTime: this.calculateAverageResponseTime(),
        errorRate: this.calculateErrorRate(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Update server status
  updateServerStatus(serverId: string, status: 'healthy' | 'unhealthy' | 'maintenance'): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = status;
      console.log(`🔄 Server ${serverId} status updated to ${status}`);
    }
  }

  // Add new server
  addServer(serverConfig: Omit<ServerInstance, 'status' | 'lastHealthCheck' | 'responseTime' | 'errorCount' | 'requestCount'>): void {
    const server: ServerInstance = {
      ...serverConfig,
      status: 'healthy',
      lastHealthCheck: new Date(),
      responseTime: 0,
      errorCount: 0,
      requestCount: 0,
    };

    this.servers.set(serverConfig.id, server);
    console.log(`➕ Server ${serverConfig.id} added to load balancer`);
  }

  // Remove server
  removeServer(serverId: string): void {
    if (this.servers.delete(serverId)) {
      console.log(`➖ Server ${serverId} removed from load balancer`);
    }
  }

  // Get metrics
  getMetrics(): any {
    return {
      current: this.metrics.get(Date.now().toString()),
      historical: Array.from(this.metrics.entries()).slice(-10), // Last 10 metrics
      summary: {
        totalMetrics: this.metrics.size,
        retentionDays: this.config.metrics.retentionDays,
      },
    };
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log('🧹 Load balancer destroyed');
  }
}

// Export singleton instance
export const loadBalancer = LoadBalancer.getInstance();
