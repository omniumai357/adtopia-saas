// Analytics service for AdTopia SaaS
// Business logic for tracking and analytics

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);
    
    // Send to Supabase or external analytics service
    this.sendToSupabase(analyticsEvent);
  }

  private async sendToSupabase(event: AnalyticsEvent): Promise<void> {
    try {
      // This would integrate with Supabase Edge Functions
      // For now, just log to console
      console.log('Analytics Event:', event);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
