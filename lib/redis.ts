import { createClient } from 'redis';

// Redis client configuration for AdTopia scaling
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
});

// Connection event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('❌ Redis Client Disconnected');
});

// Initialize connection
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('🚀 Redis connection established');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Fallback to in-memory cache for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Falling back to in-memory cache');
    }
  }
};

// Cache utility functions
export const cache = {
  // Set cache with TTL
  async set(key: string, value: any, ttl: number = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache value
  async get(key: string) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache key
  async del(key: string) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key: string) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>, ttl: number = 3600) {
    try {
      const pipeline = redisClient.multi();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        pipeline.setEx(key, ttl, serialized);
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },

  // Get multiple keys
  async mget(keys: string[]) {
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  // Increment counter
  async incr(key: string, ttl: number = 3600) {
    try {
      const result = await redisClient.incr(key);
      if (result === 1) {
        await redisClient.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  },

  // Get cache statistics
  async stats() {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');
      return {
        memory: info,
        keyspace: keyspace,
        connected: redisClient.isReady,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  },
};

// Session management with Redis
export const sessionCache = {
  // Store user session
  async setSession(sessionId: string, userData: any, ttl: number = 3600) {
    const key = `session:${sessionId}`;
    return await cache.set(key, userData, ttl);
  },

  // Get user session
  async getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    return await cache.get(key);
  },

  // Delete user session
  async deleteSession(sessionId: string) {
    const key = `session:${sessionId}`;
    return await cache.del(key);
  },

  // Extend session TTL
  async extendSession(sessionId: string, ttl: number = 3600) {
    const key = `session:${sessionId}`;
    const exists = await cache.exists(key);
    if (exists) {
      await redisClient.expire(key, ttl);
      return true;
    }
    return false;
  },
};

// API response caching
export const apiCache = {
  // Cache API response
  async cacheResponse(endpoint: string, params: any, response: any, ttl: number = 1800) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await cache.set(key, response, ttl);
  },

  // Get cached API response
  async getCachedResponse(endpoint: string, params: any) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await cache.get(key);
  },

  // Invalidate API cache
  async invalidateCache(endpoint: string) {
    const pattern = `api:${endpoint}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  },
};

// Rate limiting with Redis
export const rateLimit = {
  // Check rate limit
  async checkLimit(identifier: string, limit: number, window: number) {
    const key = `rate_limit:${identifier}`;
    const current = await cache.incr(key, window);
    
    if (current > limit) {
      return { allowed: false, remaining: 0, resetTime: window };
    }
    
    return { 
      allowed: true, 
      remaining: limit - current, 
      resetTime: window 
    };
  },

  // Reset rate limit
  async resetLimit(identifier: string) {
    const key = `rate_limit:${identifier}`;
    return await cache.del(key);
  },
};

// Initialize Redis connection
connectRedis();

export default redisClient;
