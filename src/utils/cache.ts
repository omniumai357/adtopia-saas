// Create: src/utils/cache.ts
// High-performance session storage for agency partner scaling

import { createClient } from 'redis';

interface CacheConfig {
  url: string;
  ttl: number;
}

class AdTopiaCache {
  private client;
  private ttl: number;

  constructor(config: CacheConfig) {
    this.client = createClient({ url: config.url });
    this.ttl = config.ttl;
  }

  async init() {
    await this.client.connect();
  }

  // Agency partner session caching
  async setAgencySession(agencyId: string, sessionData: any) {
    const key = `agency:${agencyId}:session`;
    await this.client.setEx(key, this.ttl, JSON.stringify(sessionData));
  }

  async getAgencySession(agencyId: string) {
    const key = `agency:${agencyId}:session`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Commission calculation caching
  async cacheCommission(agencyId: string, saleAmount: number, commission: number) {
    const key = `commission:${agencyId}:${saleAmount}`;
    await this.client.setEx(key, 3600, commission.toString()); // 1 hour cache
  }

  async getCachedCommission(agencyId: string, saleAmount: number): Promise<number | null> {
    const key = `commission:${agencyId}:${saleAmount}`;
    const cached = await this.client.get(key);
    return cached ? parseFloat(cached) : null;
  }

  // Real-time metrics caching
  async setMetrics(metrics: any) {
    await this.client.setEx('metrics:realtime', 60, JSON.stringify(metrics));
  }

  async getMetrics() {
    const data = await this.client.get('metrics:realtime');
    return data ? JSON.parse(data) : null;
  }
}

export const cache = new AdTopiaCache({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: 1800 // 30 minutes default
});
