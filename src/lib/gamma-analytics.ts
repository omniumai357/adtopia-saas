/**
 * Gamma Analytics Utility
 * Description: Track gallery card interactions and A/B test performance
 * Author: omniumai357
 * Date: 2025-10-09
 */

import { createClient } from '@supabase/supabase-js';

// Create Supabase client with proper authentication
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export interface GammaAnalyticsEvent {
  gamma_gallery_id: string;
  event_type: 'gamma_card_view' | 'gamma_card_click' | 'gamma_card_zoom' | 'gamma_cta_click';
  variant?: string;
  dwell_time_seconds?: number;
  cta_variant?: string;
  utm_campaign?: string;
  user_agent?: string;
  referrer?: string;
}

export interface GammaCardData {
  id: string;
  title: string;
  niche: string;
  cta_type: string;
  utm_campaign: string;
  fomo_score: number;
}

class GammaAnalytics {
  private sessionStartTime: number = Date.now();
  private cardViewTimes: Map<string, number> = new Map();
  private isTrackingEnabled: boolean = true;

  constructor() {
    // Initialize session tracking
    this.sessionStartTime = Date.now();
    
    // Track page visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackSessionEnd();
        }
      });

      // Track before page unload
      window.addEventListener('beforeunload', () => {
        this.trackSessionEnd();
      });
    }
  }

  /**
   * Track when a gallery card is viewed
   */
  async trackCardView(cardData: GammaCardData): Promise<void> {
    if (!this.isTrackingEnabled) return;

    const viewTime = Date.now();
    this.cardViewTimes.set(cardData.id, viewTime);

    const event: GammaAnalyticsEvent = {
      gamma_gallery_id: cardData.id,
      event_type: 'gamma_card_view',
      variant: this.getCurrentVariant(),
      utm_campaign: cardData.utm_campaign,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    try {
      await supabase.from('ab_tests').insert({
        gamma_gallery_id: cardData.id,
        variant: event.variant,
        event_type: event.event_type,
        utm_campaign: event.utm_campaign,
        user_agent: event.user_agent,
        referrer: event.referrer,
        created_at: new Date().toISOString()
      });

      console.log(`📊 Tracked card view: ${cardData.title}`);
    } catch (error) {
      console.error('❌ Failed to track card view:', error);
    }
  }

  /**
   * Track when a gallery card is clicked
   */
  async trackCardClick(cardData: GammaCardData): Promise<void> {
    if (!this.isTrackingEnabled) return;

    const viewTime = this.cardViewTimes.get(cardData.id);
    const dwellTime = viewTime ? Math.floor((Date.now() - viewTime) / 1000) : 0;

    const event: GammaAnalyticsEvent = {
      gamma_gallery_id: cardData.id,
      event_type: 'gamma_card_click',
      variant: this.getCurrentVariant(),
      dwell_time_seconds: dwellTime,
      cta_variant: cardData.cta_type,
      utm_campaign: cardData.utm_campaign,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    try {
      await supabase.from('ab_tests').insert({
        gamma_gallery_id: cardData.id,
        variant: event.variant,
        event_type: event.event_type,
        dwell_time_seconds: event.dwell_time_seconds,
        cta_variant: event.cta_variant,
        utm_campaign: event.utm_campaign,
        user_agent: event.user_agent,
        referrer: event.referrer,
        created_at: new Date().toISOString()
      });

      console.log(`📊 Tracked card click: ${cardData.title} (dwell: ${dwellTime}s)`);
    } catch (error) {
      console.error('❌ Failed to track card click:', error);
    }
  }

  /**
   * Track when a gallery card image is zoomed
   */
  async trackCardZoom(cardData: GammaCardData): Promise<void> {
    if (!this.isTrackingEnabled) return;

    const event: GammaAnalyticsEvent = {
      gamma_gallery_id: cardData.id,
      event_type: 'gamma_card_zoom',
      variant: this.getCurrentVariant(),
      utm_campaign: cardData.utm_campaign,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    try {
      await supabase.from('ab_tests').insert({
        gamma_gallery_id: cardData.id,
        variant: event.variant,
        event_type: event.event_type,
        utm_campaign: event.utm_campaign,
        user_agent: event.user_agent,
        referrer: event.referrer,
        created_at: new Date().toISOString()
      });

      console.log(`📊 Tracked card zoom: ${cardData.title}`);
    } catch (error) {
      console.error('❌ Failed to track card zoom:', error);
    }
  }

  /**
   * Track when a CTA button is clicked
   */
  async trackCtaClick(cardData: GammaCardData, ctaText: string): Promise<void> {
    if (!this.isTrackingEnabled) return;

    const event: GammaAnalyticsEvent = {
      gamma_gallery_id: cardData.id,
      event_type: 'gamma_cta_click',
      variant: this.getCurrentVariant(),
      cta_variant: cardData.cta_type,
      utm_campaign: cardData.utm_campaign,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    try {
      await supabase.from('ab_tests').insert({
        gamma_gallery_id: cardData.id,
        variant: event.variant,
        event_type: event.event_type,
        cta_variant: event.cta_variant,
        utm_campaign: event.utm_campaign,
        user_agent: event.user_agent,
        referrer: event.referrer,
        created_at: new Date().toISOString()
      });

      console.log(`📊 Tracked CTA click: ${cardData.title} - "${ctaText}"`);
    } catch (error) {
      console.error('❌ Failed to track CTA click:', error);
    }
  }

  /**
   * Track session end with total dwell time
   */
  private async trackSessionEnd(): Promise<void> {
    if (!this.isTrackingEnabled) return;

    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    try {
      await supabase.from('ab_tests').insert({
        event_type: 'session_end',
        dwell_time_seconds: sessionDuration,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        created_at: new Date().toISOString()
      });

      console.log(`📊 Tracked session end: ${sessionDuration}s`);
    } catch (error) {
      console.error('❌ Failed to track session end:', error);
    }
  }

  /**
   * Get current A/B test variant
   */
  private getCurrentVariant(): string {
    // Check for UTM parameter
    const urlParams = new URLSearchParams(window.location.search);
    const utmVariant = urlParams.get('variant');
    if (utmVariant) return utmVariant;

    // Check for stored variant in localStorage
    const storedVariant = localStorage.getItem('ab_variant');
    if (storedVariant) return storedVariant;

    // Default variant
    return 'A';
  }

  /**
   * Enable or disable tracking
   */
  setTrackingEnabled(enabled: boolean): void {
    this.isTrackingEnabled = enabled;
  }

  /**
   * Get analytics summary for a specific card
   */
  async getCardAnalytics(cardId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('gamma_gallery_id', cardId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        total_views: data.filter(d => d.event_type === 'gamma_card_view').length,
        total_clicks: data.filter(d => d.event_type === 'gamma_card_click').length,
        total_zooms: data.filter(d => d.event_type === 'gamma_card_zoom').length,
        total_cta_clicks: data.filter(d => d.event_type === 'gamma_cta_click').length,
        avg_dwell_time: this.calculateAverageDwellTime(data),
        conversion_rate: this.calculateConversionRate(data)
      };
    } catch (error) {
      console.error('❌ Failed to get card analytics:', error);
      return null;
    }
  }

  /**
   * Calculate average dwell time from analytics data
   */
  private calculateAverageDwellTime(data: any[]): number {
    const dwellTimes = data
      .filter(d => d.dwell_time_seconds)
      .map(d => d.dwell_time_seconds);
    
    if (dwellTimes.length === 0) return 0;
    
    return Math.round(dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length);
  }

  /**
   * Calculate conversion rate (clicks / views)
   */
  private calculateConversionRate(data: any[]): number {
    const views = data.filter(d => d.event_type === 'gamma_card_view').length;
    const clicks = data.filter(d => d.event_type === 'gamma_card_click').length;
    
    if (views === 0) return 0;
    
    return Math.round((clicks / views) * 100);
  }
}

// Export singleton instance
export const gammaAnalytics = new GammaAnalytics();

// Export utility functions
export const trackGammaCardView = (cardData: GammaCardData) => 
  gammaAnalytics.trackCardView(cardData);

export const trackGammaCardClick = (cardData: GammaCardData) => 
  gammaAnalytics.trackCardClick(cardData);

export const trackGammaCardZoom = (cardData: GammaCardData) => 
  gammaAnalytics.trackCardZoom(cardData);

export const trackGammaCtaClick = (cardData: GammaCardData, ctaText: string) => 
  gammaAnalytics.trackCtaClick(cardData, ctaText);
