import { useCallback, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useABTest } from './useABTest';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RMoversEventType = 'cta_view' | 'cta_click' | 'quote_request' | 'signup_complete' | 'engagement_start' | 'engagement_end';

interface RMoversMetadata {
  service: 'movers';
  card_type?: 'urgency_red' | 'value_blue' | 'hybrid';
  cta_text?: string;
  engagement_start_time?: number;
  dwell_time?: number;
  quote_type?: 'family' | 'business' | 'student';
  urgency_level?: 'high' | 'medium' | 'low';
  [key: string]: any;
}

/**
 * Enhanced tracking hook for R Movers A/B testing
 * Tracks engagement time, dwell time, and service-specific metrics
 */
export function useRMoversTracking() {
  const { variant } = useABTest();
  const engagementStartTime = useRef<number | null>(null);
  const dwellStartTime = useRef<number | null>(null);

  /**
   * Track R Movers specific events with enhanced metrics
   */
  const trackRMoversEvent = useCallback(async (
    eventType: RMoversEventType,
    metadata: RMoversMetadata = { service: 'movers' }
  ) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate engagement time if this is an engagement end event
      let engagementTime = 0;
      if (eventType === 'engagement_end' && engagementStartTime.current) {
        engagementTime = Math.floor((Date.now() - engagementStartTime.current) / 1000);
        engagementStartTime.current = null;
      }

      // Calculate dwell time if this is a view event
      let dwellTime = 0;
      if (eventType === 'cta_view') {
        dwellStartTime.current = Date.now();
      } else if (dwellStartTime.current) {
        dwellTime = Math.floor((Date.now() - dwellStartTime.current) / 1000);
      }

      // Prepare tracking data
      const trackingData = {
        user_id: user?.id || null,
        variant: variant,
        event_type: eventType,
        service: 'movers',
        engagement_time_seconds: engagementTime || null,
        dwell_time_seconds: dwellTime || null,
        metadata: {
          ...metadata,
          page_url: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          timestamp: new Date().toISOString(),
          variant_type: variant === 'A' ? 'urgency_red' : 'value_blue'
        }
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('track_ab_conversion', {
        body: trackingData
      });

      if (error) {
        console.error('Failed to track R Movers event:', error);
        return { success: false, error };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[R Movers] Event tracked: ${eventType} for variant ${variant}`, trackingData);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error tracking R Movers event:', error);
      return { success: false, error };
    }
  }, [variant]);

  /**
   * Track card view with engagement start
   */
  const trackCardView = useCallback(async (cardType: 'urgency_red' | 'value_blue', ctaText: string) => {
    engagementStartTime.current = Date.now();
    return trackRMoversEvent('cta_view', {
      service: 'movers',
      card_type: cardType,
      cta_text: ctaText,
      engagement_start_time: engagementStartTime.current
    });
  }, [trackRMoversEvent]);

  /**
   * Track CTA click with engagement metrics
   */
  const trackCTAClick = useCallback(async (ctaText: string, urgencyLevel: 'high' | 'medium' | 'low' = 'medium') => {
    return trackRMoversEvent('cta_click', {
      service: 'movers',
      cta_text: ctaText,
      urgency_level: urgencyLevel,
      click_timestamp: new Date().toISOString()
    });
  }, [trackRMoversEvent]);

  /**
   * Track quote request with type classification
   */
  const trackQuoteRequest = useCallback(async (quoteType: 'family' | 'business' | 'student', dwellTime?: number) => {
    return trackRMoversEvent('quote_request', {
      service: 'movers',
      quote_type: quoteType,
      dwell_time: dwellTime || (dwellStartTime.current ? Math.floor((Date.now() - dwellStartTime.current) / 1000) : 0)
    });
  }, [trackRMoversEvent]);

  /**
   * Track signup completion
   */
  const trackSignupComplete = useCallback(async (quoteType: 'family' | 'business' | 'student') => {
    return trackRMoversEvent('signup_complete', {
      service: 'movers',
      quote_type: quoteType,
      signup_timestamp: new Date().toISOString()
    });
  }, [trackRMoversEvent]);

  /**
   * Track engagement end (when user leaves card)
   */
  const trackEngagementEnd = useCallback(async () => {
    return trackRMoversEvent('engagement_end', {
      service: 'movers',
      engagement_end_timestamp: new Date().toISOString()
    });
  }, [trackRMoversEvent]);

  // Auto-track engagement end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (engagementStartTime.current) {
        trackEngagementEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackEngagementEnd]);

  return {
    trackCardView,
    trackCTAClick,
    trackQuoteRequest,
    trackSignupComplete,
    trackEngagementEnd,
    currentVariant: variant,
    currentCardType: variant === 'A' ? 'urgency_red' : 'value_blue'
  };
}
