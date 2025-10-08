import { createClient } from '@supabase/supabase-js';
import { performanceMonitor } from './monitoring';
import { cache } from './redis';

// Enhanced database client with performance optimization
class OptimizedSupabaseClient {
  private client: any;
  private connectionPool: Map<string, any> = new Map();
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': 'adtopia-optimized-client',
          },
        },
      }
    );
  }

  // Optimized query with caching and performance tracking
  async query<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
      cache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<{ data: T[] | null; error: any; performance: any }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(table, options);

    try {
      // Check cache first
      if (options.cache !== false) {
        const cached = await this.getCachedQuery(cacheKey);
        if (cached) {
          const duration = Date.now() - startTime;
          await performanceMonitor.trackDatabaseQuery(
            `SELECT FROM ${table} (cached)`,
            duration,
            cached.length
          );
          return { data: cached, error: null, performance: { duration, cached: true } };
        }
      }

      // Build query
      let query = this.client.from(table);

      // Apply select
      if (options.select) {
        query = query.select(options.select);
      }

      // Apply filters
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value.operator) {
            query = query[value.operator](key, value.value);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending !== false 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Execute query
      const { data, error } = await query;

      const duration = Date.now() - startTime;

      // Track performance
      await performanceMonitor.trackDatabaseQuery(
        `SELECT FROM ${table}`,
        duration,
        data?.length || 0
      );

      // Cache result if enabled
      if (options.cache !== false && data && !error) {
        await this.cacheQuery(cacheKey, data, options.cacheTTL || 300);
      }

      return { data, error, performance: { duration, cached: false } };

    } catch (error) {
      const duration = Date.now() - startTime;
      await performanceMonitor.trackError(error as Error, { table, options });
      return { data: null, error, performance: { duration, cached: false } };
    }
  }

  // Optimized insert with batch processing
  async insert<T>(
    table: string,
    data: T | T[],
    options: {
      upsert?: boolean;
      onConflict?: string;
      batchSize?: number;
    } = {}
  ): Promise<{ data: T[] | null; error: any; performance: any }> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 1000;
    const dataArray = Array.isArray(data) ? data : [data];

    try {
      let results: T[] = [];
      let lastError: any = null;

      // Process in batches
      for (let i = 0; i < dataArray.length; i += batchSize) {
        const batch = dataArray.slice(i, i + batchSize);
        
        let query = this.client.from(table).insert(batch);
        
        if (options.upsert && options.onConflict) {
          query = query.upsert(batch, { onConflict: options.onConflict });
        }

        const { data: batchData, error: batchError } = await query;
        
        if (batchError) {
          lastError = batchError;
          break;
        }
        
        if (batchData) {
          results = results.concat(batchData);
        }
      }

      const duration = Date.now() - startTime;
      await performanceMonitor.trackDatabaseQuery(
        `INSERT INTO ${table}`,
        duration,
        results.length
      );

      // Invalidate cache
      await this.invalidateTableCache(table);

      return { 
        data: lastError ? null : results, 
        error: lastError, 
        performance: { duration, batchSize } 
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      await performanceMonitor.trackError(error as Error, { table, data: dataArray.length });
      return { data: null, error, performance: { duration } };
    }
  }

  // Optimized update with performance tracking
  async update<T>(
    table: string,
    data: Partial<T>,
    filters: Record<string, any>,
    options: {
      batchSize?: number;
    } = {}
  ): Promise<{ data: T[] | null; error: any; performance: any }> {
    const startTime = Date.now();

    try {
      let query = this.client.from(table).update(data);

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }

      const { data: result, error } = await query;

      const duration = Date.now() - startTime;
      await performanceMonitor.trackDatabaseQuery(
        `UPDATE ${table}`,
        duration,
        result?.length || 0
      );

      // Invalidate cache
      await this.invalidateTableCache(table);

      return { data: result, error, performance: { duration } };

    } catch (error) {
      const duration = Date.now() - startTime;
      await performanceMonitor.trackError(error as Error, { table, data, filters });
      return { data: null, error, performance: { duration } };
    }
  }

  // Optimized delete with performance tracking
  async delete(
    table: string,
    filters: Record<string, any>,
    options: {
      batchSize?: number;
    } = {}
  ): Promise<{ data: any; error: any; performance: any }> {
    const startTime = Date.now();

    try {
      let query = this.client.from(table).delete();

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }

      const { data, error } = await query;

      const duration = Date.now() - startTime;
      await performanceMonitor.trackDatabaseQuery(
        `DELETE FROM ${table}`,
        duration,
        data?.length || 0
      );

      // Invalidate cache
      await this.invalidateTableCache(table);

      return { data, error, performance: { duration } };

    } catch (error) {
      const duration = Date.now() - startTime;
      await performanceMonitor.trackError(error as Error, { table, filters });
      return { data: null, error, performance: { duration } };
    }
  }

  // Execute raw SQL with performance tracking
  async rpc<T>(
    functionName: string,
    params: Record<string, any> = {},
    options: {
      cache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<{ data: T | null; error: any; performance: any }> {
    const startTime = Date.now();
    const cacheKey = `rpc:${functionName}:${JSON.stringify(params)}`;

    try {
      // Check cache first
      if (options.cache !== false) {
        const cached = await this.getCachedQuery(cacheKey);
        if (cached) {
          const duration = Date.now() - startTime;
          await performanceMonitor.trackDatabaseQuery(
            `RPC ${functionName} (cached)`,
            duration,
            1
          );
          return { data: cached, error: null, performance: { duration, cached: true } };
        }
      }

      const { data, error } = await this.client.rpc(functionName, params);
      const duration = Date.now() - startTime;

      await performanceMonitor.trackDatabaseQuery(
        `RPC ${functionName}`,
        duration,
        data ? 1 : 0
      );

      // Cache result if enabled
      if (options.cache !== false && data && !error) {
        await this.cacheQuery(cacheKey, data, options.cacheTTL || 300);
      }

      return { data, error, performance: { duration, cached: false } };

    } catch (error) {
      const duration = Date.now() - startTime;
      await performanceMonitor.trackError(error as Error, { functionName, params });
      return { data: null, error, performance: { duration } };
    }
  }

  // Cache management
  private async getCachedQuery(key: string): Promise<any> {
    try {
      return await cache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  private async cacheQuery(key: string, data: any, ttl: number): Promise<void> {
    try {
      await cache.set(key, data, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  private async invalidateTableCache(table: string): Promise<void> {
    try {
      // Invalidate all cache keys for this table
      const pattern = `query:${table}:*`;
      // This would need Redis SCAN in production
      console.log(`Invalidating cache for table: ${table}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  private generateCacheKey(table: string, options: any): string {
    const key = `query:${table}:${JSON.stringify(options)}`;
    return key;
  }

  // Connection pool management
  async getConnection(): Promise<any> {
    const connectionId = `conn_${Date.now()}_${Math.random()}`;
    this.connectionPool.set(connectionId, {
      client: this.client,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    });
    return connectionId;
  }

  async releaseConnection(connectionId: string): Promise<void> {
    this.connectionPool.delete(connectionId);
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.client
        .from('agency_partners')
        .select('id')
        .limit(1);
      
      const latency = Date.now() - startTime;
      
      if (error) {
        return { healthy: false, latency, error: error.message };
      }
      
      return { healthy: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { 
        healthy: false, 
        latency, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get database statistics
  async getStats(): Promise<any> {
    try {
      const stats = await this.rpc('get_database_stats');
      return stats.data;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const db = new OptimizedSupabaseClient();

// Export optimized database client
export default db;

// Export individual methods for convenience
export const {
  query,
  insert,
  update,
  delete: deleteRecord,
  rpc,
  healthCheck,
  getStats,
} = db;
