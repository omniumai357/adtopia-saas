// Cloud-native performance monitoring

export class AdTopiaMonitoring {
  static trackOptimization(leadId: string, confidence: number, action: string) {
    // Send to your analytics platform
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'ai_optimization', {
        lead_id: leadId,
        confidence,
        recommended_action: action,
        timestamp: Date.now()
      });
    }
  }

  static trackConversion(leadId: string, dealValue: number) {
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'conversion', {
        lead_id: leadId,
        value: dealValue,
        currency: 'USD'
      });
    }
  }

  static trackPerformance(endpoint: string, duration: number) {
    console.log(`Performance: ${endpoint} took ${duration}ms`);
    
    // Alert if performance degrades
    if (duration > 5000) {
      console.warn(`Slow endpoint detected: ${endpoint}`);
    }
  }
}
