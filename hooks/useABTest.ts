import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface ABTestResult {
  variant: 'A' | 'B';
  isVariantA: boolean;
  isVariantB: boolean;
}

/**
 * A/B Test Hook for Onboarding CTA Testing
 * Assigns users to variants A or B with persistent cookie-based assignment
 * Server-side safe with no SSR mismatches
 */
export function useABTest(): ABTestResult {
  const [variant, setVariant] = useState<'A' | 'B'>('A'); // Default to A for SSR
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    setIsHydrated(true);
    
    const cookieName = 'ab_variant';
    const existingVariant = Cookies.get(cookieName) as 'A' | 'B' | undefined;
    
    if (existingVariant && (existingVariant === 'A' || existingVariant === 'B')) {
      // User already has a variant assigned
      setVariant(existingVariant);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[A/B Test] Existing variant: ${existingVariant}`);
      }
    } else {
      // Assign new variant 50/50 split
      const newVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(newVariant);
      
      // Set cookie with 1-year expiry
      Cookies.set(cookieName, newVariant, { 
        expires: 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[A/B Test] New variant assigned: ${newVariant}`);
      }
    }
  }, []);

  // Return default values during SSR to prevent mismatches
  if (!isHydrated) {
    return {
      variant: 'A',
      isVariantA: true,
      isVariantB: false
    };
  }

  return {
    variant,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B'
  };
}

/**
 * Clear A/B test cookie for testing purposes
 * Only works on client side
 */
export function clearABTestCookie(): void {
  if (typeof window === 'undefined') {
    console.warn('[A/B Test] clearABTestCookie can only be called on client side');
    return;
  }
  
  Cookies.remove('ab_variant');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test] Cookie cleared - next page load will assign new variant');
  }
}

/**
 * Force a specific variant for testing (development only)
 */
export function forceABTestVariant(variant: 'A' | 'B'): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[A/B Test] forceABTestVariant only works in development');
    return;
  }
  
  if (typeof window === 'undefined') {
    console.warn('[A/B Test] forceABTestVariant can only be called on client side');
    return;
  }
  
  Cookies.set('ab_variant', variant, { 
    expires: 365,
    sameSite: 'lax',
    secure: false
  });
  
  console.log(`[A/B Test] Forced variant: ${variant} - refresh page to see changes`);
}