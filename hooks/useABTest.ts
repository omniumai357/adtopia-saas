import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type ABVariant = 'A' | 'B';

interface UseABTestReturn {
  variant: ABVariant;
  isVariantA: boolean;
  isVariantB: boolean;
}

const COOKIE_NAME = 'ab_variant';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Custom React hook for A/B testing with persistent assignment
 * Assigns users to variant 'A' or 'B' with 50/50 split
 * Uses js-cookie for persistent assignment across sessions
 * Server-side safe to prevent hydration mismatches
 */
export function useABTest(): UseABTestReturn {
  const [variant, setVariant] = useState<ABVariant>('A'); // Default to 'A' for SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side to prevent SSR mismatches
    setIsClient(true);

    // Check for existing cookie
    const existingVariant = Cookies.get(COOKIE_NAME) as ABVariant;
    
    if (existingVariant && (existingVariant === 'A' || existingVariant === 'B')) {
      // User already assigned, use existing variant
      setVariant(existingVariant);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AB Test] Using existing variant: ${existingVariant}`);
      }
    } else {
      // No existing assignment, randomly assign 50/50
      const randomVariant: ABVariant = Math.random() < 0.5 ? 'A' : 'B';
      
      // Set cookie with 1-year expiry
      Cookies.set(COOKIE_NAME, randomVariant, {
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      setVariant(randomVariant);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AB Test] New assignment: ${randomVariant}`);
      }
    }
  }, []);

  // Return default values during SSR to prevent hydration mismatches
  if (!isClient) {
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
 * Clear the A/B test cookie for testing purposes
 * Useful for development and testing different variants
 */
export function clearABTestCookie(): void {
  Cookies.remove(COOKIE_NAME);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AB Test] Cookie cleared - next page load will assign new variant');
  }
}

/**
 * Get the current A/B test variant without triggering assignment
 * Useful for analytics or logging without using the hook
 */
export function getABTestVariant(): ABVariant | null {
  if (typeof window === 'undefined') {
    return null; // Server-side safe
  }
  
  const variant = Cookies.get(COOKIE_NAME) as ABVariant;
  return (variant === 'A' || variant === 'B') ? variant : null;
}

/**
 * Force assign a specific variant (for testing purposes)
 * @param variant - The variant to assign ('A' or 'B')
 */
export function forceABTestVariant(variant: ABVariant): void {
  if (typeof window === 'undefined') {
    return; // Server-side safe
  }
  
  Cookies.set(COOKIE_NAME, variant, {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AB Test] Forced assignment: ${variant}`);
  }
}
