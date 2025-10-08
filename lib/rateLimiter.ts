import { rateLimit } from './redis';

// Rate limiting configuration for AdTopia scaling
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Too many API requests, please try again later.',
  },
  
  // Authentication endpoints
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many login attempts, please try again later.',
  },
  
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many registration attempts, please try again later.',
  },
  
  // Password reset
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later.',
  },
  
  // File uploads
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    message: 'Too many file uploads, please try again later.',
  },
  
  // Admin endpoints
  ADMIN_API: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 200,
    message: 'Too many admin requests, please try again later.',
  },
  
  // Webhook endpoints
  WEBHOOK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many webhook requests, please try again later.',
  },
} as const;

// Rate limiter middleware factory
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: any, res: any, next: any) => {
    try {
      // Generate unique identifier for rate limiting
      const identifier = config.keyGenerator 
        ? config.keyGenerator(req)
        : getDefaultIdentifier(req);
      
      // Check rate limit
      const result = await rateLimit.checkLimit(
        identifier,
        config.maxRequests,
        Math.floor(config.windowMs / 1000)
      );
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + result.resetTime * 1000).toISOString(),
      });
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests, please try again later.',
          retryAfter: result.resetTime,
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request to proceed if rate limiter fails
      next();
    }
  };
}

// Default identifier generator
function getDefaultIdentifier(req: any): string {
  // Use IP address as primary identifier
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  
  // Add user ID if authenticated
  const userId = req.user?.id || req.headers['x-user-id'];
  if (userId) {
    return `user:${userId}`;
  }
  
  // Add API key if present
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    return `api:${apiKey}`;
  }
  
  return `ip:${ip}`;
}

// Advanced rate limiter with sliding window
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = Math.ceil((oldestRequest + windowMs - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: Math.ceil(windowMs / 1000),
    };
  }
  
  // Clean up old entries
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [identifier, requests] of this.requests) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// DDoS protection with advanced patterns
export class DDoSProtection {
  private static instance: DDoSProtection;
  private suspiciousIPs: Map<string, { count: number; lastSeen: number }> = new Map();
  private blockedIPs: Set<string> = new Set();
  
  static getInstance(): DDoSProtection {
    if (!DDoSProtection.instance) {
      DDoSProtection.instance = new DDoSProtection();
    }
    return DDoSProtection.instance;
  }
  
  // Check for DDoS patterns
  async checkDDoS(req: any): Promise<{ blocked: boolean; reason?: string }> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    
    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      return { blocked: true, reason: 'IP is blocked due to suspicious activity' };
    }
    
    // Check for suspicious patterns
    const suspicious = await this.detectSuspiciousActivity(ip, userAgent, referer);
    
    if (suspicious) {
      this.blockedIPs.add(ip);
      return { blocked: true, reason: 'Suspicious activity detected' };
    }
    
    return { blocked: false };
  }
  
  // Detect suspicious activity patterns
  private async detectSuspiciousActivity(ip: string, userAgent: string, referer: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const threshold = 100; // requests per minute
    
    // Get or create IP record
    const record = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0 };
    
    // Reset count if outside window
    if (now - record.lastSeen > windowMs) {
      record.count = 0;
    }
    
    // Increment count
    record.count++;
    record.lastSeen = now;
    this.suspiciousIPs.set(ip, record);
    
    // Check for suspicious patterns
    const patterns = [
      // High request rate
      record.count > threshold,
      
      // Suspicious user agent
      !userAgent || userAgent.length < 10 || userAgent.includes('bot'),
      
      // Missing or suspicious referer
      !referer || referer.includes('localhost') || referer.includes('127.0.0.1'),
      
      // Rapid requests (less than 100ms apart)
      now - record.lastSeen < 100,
    ];
    
    return patterns.some(pattern => pattern);
  }
  
  // Clean up old records
  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    // Clean up suspicious IPs
    for (const [ip, record] of this.suspiciousIPs) {
      if (now - record.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip);
      }
    }
    
    // Clean up blocked IPs
    const blockedArray = Array.from(this.blockedIPs);
    for (const ip of blockedArray) {
      const record = this.suspiciousIPs.get(ip);
      if (!record || now - record.lastSeen > maxAge) {
        this.blockedIPs.delete(ip);
      }
    }
  }
  
  // Get protection statistics
  getStats() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size,
      totalRequests: Array.from(this.suspiciousIPs.values())
        .reduce((sum, record) => sum + record.count, 0),
    };
  }
}

// Initialize DDoS protection
const ddosProtection = DDoSProtection.getInstance();

// Cleanup intervals
setInterval(() => {
  ddosProtection.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

export { ddosProtection };
