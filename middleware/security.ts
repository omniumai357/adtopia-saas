import { NextRequest, NextResponse } from 'next/server';
import { ddosProtection } from '../lib/rateLimiter';
import { AdTopiaMonitoring } from '@/src/lib/monitoring';

// Security middleware for AdTopia scaling
export class SecurityMiddleware {
  // CORS configuration
  static corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://adtopia.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-User-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  // Security headers
  static securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': this.getCSP(),
  };

  // Content Security Policy
  static getCSP(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigins = [
      "'self'",
      'https://adtopia.io',
      'https://bizbox.systems',
      'https://*.supabase.co',
      'https://*.vercel.app',
    ];

    if (!isProduction) {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
    }

    return [
      `default-src ${allowedOrigins.join(' ')}`,
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }

  // Main security middleware
  static async handleRequest(request: NextRequest): Promise<NextResponse | null> {
    const startTime = Date.now();
    const url = request.url;
    const method = request.method;
    const ip = request.ip || 'unknown';

    try {
      // 1. DDoS Protection
      const ddosCheck = await ddosProtection.checkDDoS({
        ip,
        headers: Object.fromEntries(request.headers.entries()),
      });

      if (ddosCheck.blocked) {
        console.warn(`🚫 DDoS protection blocked request from ${ip}: ${ddosCheck.reason}`);
        return new NextResponse(
          JSON.stringify({ error: 'Request blocked', reason: ddosCheck.reason }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 2. Handle preflight requests
      if (method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: this.corsHeaders,
        });
      }

      // 3. Validate request method
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return new NextResponse(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 4. Validate content type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return new NextResponse(
            JSON.stringify({ error: 'Content-Type must be application/json' }),
            { 
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // 5. Validate request size
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
        return new NextResponse(
          JSON.stringify({ error: 'Request too large' }),
          { 
            status: 413,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // 6. Validate API key for protected endpoints
      if (url.includes('/api/admin/') || url.includes('/api/protected/')) {
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');
        
        if (!apiKey && !authHeader) {
          return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            { 
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // 7. Rate limiting (handled by rate limiter middleware)
      // This is implemented in the rate limiter module

      // 8. Log security events
      await this.logSecurityEvent(request, 'request_processed');

      // Request is valid, continue processing
      return null;

    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Log security error
      await this.logSecurityEvent(request, 'security_error', error);
      
      // Return generic error to avoid information leakage
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } finally {
      // Track performance
      const duration = Date.now() - startTime;
      AdTopiaMonitoring.trackPerformance(
        new URL(url).pathname,
        duration
      );
    }
  }

  // Add security headers to response
  static addSecurityHeaders(response: NextResponse): NextResponse {
    // Add CORS headers
    Object.entries(this.corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add security headers
    Object.entries(this.securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Log security events
  static async logSecurityEvent(
    request: NextRequest, 
    eventType: string, 
    error?: any
  ): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      eventType,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', logData);
    }

    // Track in monitoring system
    AdTopiaMonitoring.trackPerformance(
      `Security Event: ${eventType}`,
      0
    );
  }

  // Validate API key
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey) return false;
    
    // Check against environment variables
    const validKeys = [
      process.env.ADMIN_API_KEY,
      process.env.INTERNAL_API_KEY,
      process.env.WEBHOOK_API_KEY,
    ].filter(Boolean);

    return validKeys.includes(apiKey);
  }

  // Validate JWT token
  static async validateJWT(token: string): Promise<{ valid: boolean; payload?: any }> {
    try {
      if (!token) return { valid: false };

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      // Basic JWT validation (in production, use proper JWT library)
      const parts = cleanToken.split('.');
      if (parts.length !== 3) return { valid: false };

      // Decode payload (in production, verify signature)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  // Sanitize input data
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
}

// Export security middleware function
export function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  return SecurityMiddleware.handleRequest(request);
}

// Export security headers function
export function addSecurityHeaders(response: NextResponse): NextResponse {
  return SecurityMiddleware.addSecurityHeaders(response);
}
