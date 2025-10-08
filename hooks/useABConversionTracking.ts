import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CTAClickData {
  email: string;
  click_timestamp: string;
  form_state: 'submitting' | 'completed' | 'abandoned';
}

interface CTADropoffData {
  email: string;
  dropoff_reason: 'page_unload' | 'tab_switch' | 'form_abandon' | 'timeout';
  form_state: 'incomplete' | 'partial';
}

/**
 * A/B Test Conversion Tracking Hook
 * Tracks CTA clicks and drop-offs for conversion analysis
 */
export function useABConversionTracking() {
  /**
   * Track CTA click events
   */
  const trackCTAClick = useCallback(async (data: CTAClickData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('track_ab_conversion', {
        body: {
          user_id: user?.id || null,
          variant: 'A', // This will be overridden by the component
          event_type: 'cta_click',
          metadata: {
            email: data.email,
            click_timestamp: data.click_timestamp,
            form_state: data.form_state,
            page_url: typeof window !== 'undefined' ? window.location.href : null,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          }
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[A/B Test] Tracked CTA click:', data);
      }
    } catch (error) {
      console.error('Failed to track CTA click:', error);
    }
  }, []);

  /**
   * Track CTA drop-off events
   */
  const trackCTADropoff = useCallback(async (data: CTADropoffData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.functions.invoke('track_ab_conversion', {
        body: {
          user_id: user?.id || null,
          variant: 'A', // This will be overridden by the component
          event_type: 'cta_dropoff',
          metadata: {
            email: data.email,
            dropoff_reason: data.dropoff_reason,
            form_state: data.form_state,
            dropoff_timestamp: new Date().toISOString(),
            page_url: typeof window !== 'undefined' ? window.location.href : null,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          }
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[A/B Test] Tracked CTA dropoff:', data);
      }
    } catch (error) {
      console.error('Failed to track CTA dropoff:', error);
    }
  }, []);

  return {
    trackCTAClick,
    trackCTADropoff
  };
}