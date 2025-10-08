import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useABTest } from './useABTest';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ConversionEventType = 'signup_complete' | 'cta_dropoff' | 'cta_view' | 'cta_click';

interface ConversionMetadata {
  email?: string;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  [key: string]: any;
}

/**
 * Custom hook for tracking A/B test conversions and events
 * Integrates with the useABTest hook to automatically include variant information
 */
export function useABConversionTracking() {
  const { variant } = useABTest();

  /**
   * Track A/B test conversion events
   * @param eventType - Type of conversion event
   * @param metadata - Additional metadata for the event
   */
  const trackConversion = useCallback(async (
    eventType: ConversionEventType,
    metadata: ConversionMetadata = {}
  ) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare tracking data
      const trackingData = {
        user_id: user?.id || null,
        variant: variant,
        event_type: eventType,
        metadata: {
          ...metadata,
          page_url: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          timestamp: new Date().toISOString()
        }
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('track_ab_conversion', {
        body: trackingData
      });

      if (error) {
        console.error('Failed to track A/B test conversion:', error);
        return { success: false, error };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[AB Test] Conversion tracked: ${eventType} for variant ${variant}`, trackingData);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error tracking A/B test conversion:', error);
      return { success: false, error };
    }
  }, [variant]);

  /**
   * Track signup completion
   * Call this after successful user registration
   */
  const trackSignupComplete = useCallback(async (metadata: ConversionMetadata = {}) => {
    return trackConversion('signup_complete', {
      ...metadata,
      conversion_type: 'signup'
    });
  }, [trackConversion]);

  /**
   * Track CTA drop-off
   * Call this when user abandons the form or leaves the page
   */
  const trackCTADropoff = useCallback(async (metadata: ConversionMetadata = {}) => {
    return trackConversion('cta_dropoff', {
      ...metadata,
      dropoff_type: 'form_abandonment'
    });
  }, [trackConversion]);

  /**
   * Track CTA view
   * Call this when the CTA is displayed to the user
   */
  const trackCTAView = useCallback(async (metadata: ConversionMetadata = {}) => {
    return trackConversion('cta_view', {
      ...metadata,
      view_type: 'cta_display'
    });
  }, [trackConversion]);

  /**
   * Track CTA click
   * Call this when the user clicks the CTA button
   */
  const trackCTAClick = useCallback(async (metadata: ConversionMetadata = {}) => {
    return trackConversion('cta_click', {
      ...metadata,
      click_type: 'cta_interaction'
    });
  }, [trackConversion]);

  return {
    trackConversion,
    trackSignupComplete,
    trackCTADropoff,
    trackCTAView,
    trackCTAClick,
    currentVariant: variant
  };
}
