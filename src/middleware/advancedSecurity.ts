// Enhanced security middleware for AdTopia revenue protection
import { monitoring } from '../utils/monitoring';
import { createHash, createHmac } from 'crypto';

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  apiKeyRotationDays: number;
  encryptionKey: string;
}

interface SecurityEvent {
  type: 'login_attempt' | 'api_access' | 'payment_attempt' | 'suspicious_activity';
  userId?: string;
  agencyId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: any;
}

export class AdvancedSecurityMiddleware {
  private static instance: AdvancedSecurityMiddleware;
  private config: SecurityConfig;
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, SecurityEvent[]> = new Map();

  static getInstance(): AdvancedSecurityMiddleware {
    if (!AdvancedSecurityMiddleware.instance) {
      AdvancedSecurityMiddleware.instance = new AdvancedSecurityMiddleware();
    }
    return AdvancedSecurityMiddleware.instance;
  }

  constructor() {
    this.config = {
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      apiKeyRotationDays: 90,
      encryptionKey: process.env.ENCRYPTION_KEY || 'default-key',
    };
  }

  // Advanced rate limiting with sliding window
  createAdvancedRateLimit(options: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: any) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }) {
    return (req: any, res: any, next: any) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Check if IP is blocked
      if (this.blockedIPs.has(key)) {
        return res.status(429).json({
          error: 'IP address is blocked due to suspicious activity',
          retryAfter: this.config.lockoutDuration / 1000,
        });
      }

      // Check rate limit
      const attempts = this.getAttempts(key, windowStart);
      
      if (attempts >= options.maxRequests) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          ip: key,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'rate_limit_exceeded', attempts },
        });

        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(options.windowMs / 1000),
        });
      }

      // Record attempt
      this.recordAttempt(key, now);
      next();
    };
  }

  // Agency authentication with enhanced validation
  validateAgencyAuth = async (req: any, res: any, next: any) => {
    try {
      const agencyId = req.headers['x-agency-id'];
      const apiKey = req.headers['x-api-key'];
      const signature = req.headers['x-signature'];
      const timestamp = req.headers['x-timestamp'];

      // Validate required headers
      if (!agencyId || !apiKey) {
        this.logSecurityEvent({
          type: 'api_access',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'missing_credentials' },
        });

        return res.status(401).json({ error: 'Missing agency credentials' });
      }

      // Validate timestamp (prevent replay attacks)
      if (timestamp && Math.abs(Date.now() - parseInt(timestamp)) > 300000) { // 5 minutes
        this.logSecurityEvent({
          type: 'api_access',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'timestamp_expired' },
        });

        return res.status(401).json({ error: 'Request timestamp expired' });
      }

      // Validate signature if provided
      if (signature && !this.validateSignature(req, signature)) {
        this.logSecurityEvent({
          type: 'api_access',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'invalid_signature' },
        });

        return res.status(401).json({ error: 'Invalid request signature' });
      }

      // Validate agency API key
      const isValid = await this.validateAgencyApiKey(agencyId, apiKey);
      
      if (!isValid) {
        this.logSecurityEvent({
          type: 'api_access',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'invalid_api_key' },
        });

        return res.status(401).json({ error: 'Invalid agency credentials' });
      }

      // Check for suspicious activity
      if (this.isSuspiciousActivity(agencyId, req.ip)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'suspicious_pattern' },
        });

        return res.status(403).json({ error: 'Suspicious activity detected' });
      }

      // Log successful authentication
      this.logSecurityEvent({
        type: 'api_access',
        agencyId,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp: new Date(),
        success: true,
      });

      req.agencyId = agencyId;
      next();
    } catch (error) {
      monitoring.trackError(error as Error, { middleware: 'validateAgencyAuth' });
      res.status(500).json({ error: 'Authentication error' });
    }
  };

  // Payment security middleware
  validatePaymentSecurity = async (req: any, res: any, next: any) => {
    try {
      const agencyId = req.agencyId;
      const paymentData = req.body;

      // Validate payment data
      if (!this.validatePaymentData(paymentData)) {
        this.logSecurityEvent({
          type: 'payment_attempt',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'invalid_payment_data' },
        });

        return res.status(400).json({ error: 'Invalid payment data' });
      }

      // Check for duplicate payments
      if (await this.isDuplicatePayment(paymentData)) {
        this.logSecurityEvent({
          type: 'payment_attempt',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'duplicate_payment' },
        });

        return res.status(400).json({ error: 'Duplicate payment detected' });
      }

      // Validate payment amount limits
      if (!this.validatePaymentAmount(agencyId, paymentData.amount)) {
        this.logSecurityEvent({
          type: 'payment_attempt',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'amount_limit_exceeded' },
        });

        return res.status(400).json({ error: 'Payment amount exceeds limit' });
      }

      next();
    } catch (error) {
      monitoring.trackError(error as Error, { middleware: 'validatePaymentSecurity' });
      res.status(500).json({ error: 'Payment validation error' });
    }
  };

  // Commission security middleware
  validateCommissionSecurity = async (req: any, res: any, next: any) => {
    try {
      const agencyId = req.agencyId;
      const commissionData = req.body;

      // Validate commission calculation
      if (!this.validateCommissionData(commissionData)) {
        this.logSecurityEvent({
          type: 'api_access',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'invalid_commission_data' },
        });

        return res.status(400).json({ error: 'Invalid commission data' });
      }

      // Check for commission manipulation
      if (await this.detectCommissionManipulation(agencyId, commissionData)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          agencyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date(),
          success: false,
          details: { reason: 'commission_manipulation' },
        });

        return res.status(403).json({ error: 'Suspicious commission activity detected' });
      }

      next();
    } catch (error) {
      monitoring.trackError(error as Error, { middleware: 'validateCommissionSecurity' });
      res.status(500).json({ error: 'Commission validation error' });
    }
  };

  // Data encryption middleware
  encryptSensitiveData = (fields: string[]) => {
    return (req: any, res: any, next: any) => {
      try {
        for (const field of fields) {
          if (req.body[field]) {
            req.body[field] = this.encrypt(req.body[field]);
          }
        }
        next();
      } catch (error) {
        monitoring.trackError(error as Error, { middleware: 'encryptSensitiveData' });
        res.status(500).json({ error: 'Data encryption error' });
      }
    };
  };

  // Data decryption middleware
  decryptSensitiveData = (fields: string[]) => {
    return (req: any, res: any, next: any) => {
      try {
        for (const field of fields) {
          if (req.body[field]) {
            req.body[field] = this.decrypt(req.body[field]);
          }
        }
        next();
      } catch (error) {
        monitoring.trackError(error as Error, { middleware: 'decryptSensitiveData' });
        res.status(500).json({ error: 'Data decryption error' });
      }
    };
  };

  // Security event logging
  private logSecurityEvent(event: SecurityEvent): void {
    try {
      const key = event.agencyId || event.userId || event.ip;
      if (!this.suspiciousActivity.has(key)) {
        this.suspiciousActivity.set(key, []);
      }
      
      this.suspiciousActivity.get(key)!.push(event);

      // Track in monitoring system
      monitoring.trackError(new Error(`Security Event: ${event.type}`), {
        type: event.type,
        success: event.success,
        details: event.details,
      });

      console.log(`🔒 Security Event: ${event.type} - ${event.success ? 'SUCCESS' : 'FAILED'}`, {
        agencyId: event.agencyId,
        userId: event.userId,
        ip: event.ip,
        details: event.details,
      });
    } catch (error) {
      console.error('❌ Failed to log security event:', error);
    }
  }

  // Validate agency API key
  private async validateAgencyApiKey(agencyId: string, apiKey: string): Promise<boolean> {
    try {
      // Implement your agency API key validation logic here
      // This should check against your database
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('❌ Failed to validate agency API key:', error);
      return false;
    }
  }

  // Validate request signature
  private validateSignature(req: any, signature: string): boolean {
    try {
      const timestamp = req.headers['x-timestamp'];
      const body = JSON.stringify(req.body);
      const expectedSignature = createHmac('sha256', this.config.encryptionKey)
        .update(`${timestamp}:${body}`)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Failed to validate signature:', error);
      return false;
    }
  }

  // Check for suspicious activity
  private isSuspiciousActivity(agencyId: string, ip: string): boolean {
    const events = this.suspiciousActivity.get(agencyId) || [];
    const recentEvents = events.filter(
      event => Date.now() - event.timestamp.getTime() < 3600000 // 1 hour
    );

    // Check for multiple failed attempts
    const failedAttempts = recentEvents.filter(event => !event.success);
    if (failedAttempts.length > 10) {
      return true;
    }

    // Check for unusual patterns
    const uniqueIPs = new Set(recentEvents.map(event => event.ip));
    if (uniqueIPs.size > 5) {
      return true;
    }

    return false;
  }

  // Validate payment data
  private validatePaymentData(paymentData: any): boolean {
    try {
      // Basic validation
      if (!paymentData.amount || !paymentData.currency || !paymentData.paymentMethod) {
        return false;
      }

      // Amount validation
      if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
        return false;
      }

      // Currency validation
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
      if (!validCurrencies.includes(paymentData.currency)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to validate payment data:', error);
      return false;
    }
  }

  // Check for duplicate payments
  private async isDuplicatePayment(paymentData: any): Promise<boolean> {
    try {
      // Implement duplicate payment detection logic
      // This should check against your database
      return false; // Placeholder
    } catch (error) {
      console.error('❌ Failed to check duplicate payment:', error);
      return false;
    }
  }

  // Validate payment amount limits
  private validatePaymentAmount(agencyId: string, amount: number): boolean {
    try {
      // Implement payment amount validation based on agency tier
      // This should check against your database
      const maxAmount = 10000; // Placeholder
      return amount <= maxAmount;
    } catch (error) {
      console.error('❌ Failed to validate payment amount:', error);
      return false;
    }
  }

  // Validate commission data
  private validateCommissionData(commissionData: any): boolean {
    try {
      if (!commissionData.saleAmount || !commissionData.commissionRate) {
        return false;
      }

      if (typeof commissionData.saleAmount !== 'number' || commissionData.saleAmount <= 0) {
        return false;
      }

      if (typeof commissionData.commissionRate !== 'number' || 
          commissionData.commissionRate < 0 || 
          commissionData.commissionRate > 1) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to validate commission data:', error);
      return false;
    }
  }

  // Detect commission manipulation
  private async detectCommissionManipulation(agencyId: string, commissionData: any): Promise<boolean> {
    try {
      // Implement commission manipulation detection logic
      // This should check against historical data and patterns
      return false; // Placeholder
    } catch (error) {
      console.error('❌ Failed to detect commission manipulation:', error);
      return false;
    }
  }

  // Encrypt sensitive data
  private encrypt(data: string): string {
    try {
      const cipher = createHash('sha256');
      cipher.update(data + this.config.encryptionKey);
      return cipher.digest('hex');
    } catch (error) {
      console.error('❌ Failed to encrypt data:', error);
      return data;
    }
  }

  // Decrypt sensitive data
  private decrypt(encryptedData: string): string {
    try {
      // Implement proper decryption logic
      // For now, return the encrypted data as placeholder
      return encryptedData;
    } catch (error) {
      console.error('❌ Failed to decrypt data:', error);
      return encryptedData;
    }
  }

  // Get attempts for rate limiting
  private getAttempts(key: string, windowStart: number): number {
    const attempts = this.failedAttempts.get(key);
    if (!attempts) return 0;
    
    if (attempts.lastAttempt.getTime() < windowStart) {
      this.failedAttempts.delete(key);
      return 0;
    }
    
    return attempts.count;
  }

  // Record attempt for rate limiting
  private recordAttempt(key: string, timestamp: number): void {
    const attempts = this.failedAttempts.get(key);
    if (attempts) {
      attempts.count++;
      attempts.lastAttempt = new Date(timestamp);
    } else {
      this.failedAttempts.set(key, { count: 1, lastAttempt: new Date(timestamp) });
    }
  }

  // Get security statistics
  getSecurityStats(): any {
    return {
      blockedIPs: this.blockedIPs.size,
      failedAttempts: this.failedAttempts.size,
      suspiciousActivity: this.suspiciousActivity.size,
      config: this.config,
      timestamp: new Date().toISOString(),
    };
  }

  // Clean up old data
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up failed attempts
    for (const [key, attempts] of this.failedAttempts) {
      if (now - attempts.lastAttempt.getTime() > maxAge) {
        this.failedAttempts.delete(key);
      }
    }

    // Clean up suspicious activity
    for (const [key, events] of this.suspiciousActivity) {
      const recentEvents = events.filter(
        event => now - event.timestamp.getTime() < maxAge
      );
      
      if (recentEvents.length === 0) {
        this.suspiciousActivity.delete(key);
      } else {
        this.suspiciousActivity.set(key, recentEvents);
      }
    }

    console.log('🧹 Security middleware cleanup completed');
  }
}

// Export singleton instance
export const advancedSecurity = AdvancedSecurityMiddleware.getInstance();

// Cleanup interval
setInterval(() => {
  advancedSecurity.cleanup();
}, 60 * 60 * 1000); // Every hour
