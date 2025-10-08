// Create: src/middleware/security.ts
// Enterprise-grade security for revenue protection

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting for agency API endpoints
export const agencyApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each agency to 100 requests per windowMs
  message: {
    error: 'Too many requests from this agency',
    retryAfter: '15 minutes'
  },
  keyGenerator: (req) => {
    return req.headers['x-agency-id'] as string || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for payment endpoints
export const paymentApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Maximum 5 payment requests per minute
  message: {
    error: 'Payment rate limit exceeded',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Commission calculation rate limiting
export const commissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 commission calculations per 5 minutes
  keyGenerator: (req) => {
    return `${req.headers['x-agency-id']}-commission`;
  }
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://auyjsmtnfnnapjdrzhea.supabase.co"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Agency authentication middleware
export const validateAgencyAuth = async (req: any, res: any, next: any) => {
  try {
    const agencyId = req.headers['x-agency-id'];
    const apiKey = req.headers['x-api-key'];
    
    if (!agencyId || !apiKey) {
      return res.status(401).json({ error: 'Missing agency credentials' });
    }
    
    // Validate agency API key (implement your validation logic)
    const isValid = await validateAgencyApiKey(agencyId, apiKey);
    
    if (!isValid) {
      monitoring.trackError(new Error('Invalid agency credentials'), { agencyId });
      return res.status(401).json({ error: 'Invalid agency credentials' });
    }
    
    req.agencyId = agencyId;
    next();
  } catch (error) {
    monitoring.trackError(error as Error, { middleware: 'validateAgencyAuth' });
    res.status(500).json({ error: 'Authentication error' });
  }
};

async function validateAgencyApiKey(agencyId: string, apiKey: string): Promise<boolean> {
  // Implement your agency API key validation logic here
  // This should check against your database
  return true; // Placeholder
}
