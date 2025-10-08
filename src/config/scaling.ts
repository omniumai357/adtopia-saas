// Create: src/config/scaling.ts
// Horizontal scaling configuration for revenue growth

interface ScalingConfig {
  loadBalancer: {
    algorithm: 'round-robin' | 'least-connections' | 'ip-hash';
    healthCheck: {
      path: string;
      interval: number;
      timeout: number;
      retries: number;
    };
  };
  autoScaling: {
    minInstances: number;
    maxInstances: number;
    targetCpuPercent: number;
    targetMemoryPercent: number;
    scaleUpCooldown: number;
    scaleDownCooldown: number;
  };
  database: {
    readReplicas: number;
    connectionPoolSize: number;
    queryTimeout: number;
  };
}

export const scalingConfig: ScalingConfig = {
  loadBalancer: {
    algorithm: 'least-connections',
    healthCheck: {
      path: '/health',
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retries: 3
    }
  },
  autoScaling: {
    minInstances: 2,
    maxInstances: 20,
    targetCpuPercent: 70,
    targetMemoryPercent: 80,
    scaleUpCooldown: 300,   // 5 minutes
    scaleDownCooldown: 900  // 15 minutes
  },
  database: {
    readReplicas: 3,
    connectionPoolSize: 20,
    queryTimeout: 30000
  }
};

// Health check endpoint for load balancer
export const healthCheck = async () => {
  try {
    // Check database connectivity
    const dbStatus = await checkDatabaseHealth();
    
    // Check cache connectivity
    const cacheStatus = await checkCacheHealth();
    
    // Check external services
    const stripeStatus = await checkStripeHealth();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        cache: cacheStatus,
        stripe: stripeStatus
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    };
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

async function checkDatabaseHealth(): Promise<boolean> {
  // Implement database health check
  return true;
}

async function checkCacheHealth(): Promise<boolean> {
  // Implement cache health check
  return true;
}

async function checkStripeHealth(): Promise<boolean> {
  // Implement Stripe health check
  return true;
}
