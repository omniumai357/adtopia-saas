# A/B Testing Guide for AdTopia Onboarding Flow

## Overview

This guide covers the implementation and usage of A/B testing in the AdTopia onboarding flow using the custom `useABTest` React hook.

## Features

- **Persistent Assignment**: Users are assigned to variants using cookies with 1-year expiry
- **50/50 Split**: Random assignment with equal distribution between variants A and B
- **SSR Safe**: Prevents hydration mismatches between server and client
- **Development Friendly**: Console logging and testing utilities
- **Lightweight**: No external dependencies beyond `js-cookie`

## Installation

Ensure `js-cookie` is installed:

```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

## Basic Usage

```tsx
import { useABTest } from '@/hooks/useABTest';

function MyComponent() {
  const { variant, isVariantA, isVariantB } = useABTest();

  return (
    <div>
      {isVariantA ? (
        <div>Variant A Content</div>
      ) : (
        <div>Variant B Content</div>
      )}
    </div>
  );
}
```

## Hook API

### `useABTest()`

Returns an object with:

- **`variant`**: `'A' | 'B'` - The assigned variant
- **`isVariantA`**: `boolean` - True if variant is 'A'
- **`isVariantB`**: `boolean` - True if variant is 'B'

### Utility Functions

#### `clearABTestCookie()`
Clears the A/B test cookie for testing purposes.

```tsx
import { clearABTestCookie } from '@/hooks/useABTest';

// Clear cookie to test different variants
clearABTestCookie();
```

#### `getABTestVariant()`
Get the current variant without triggering assignment.

```tsx
import { getABTestVariant } from '@/hooks/useABTest';

const currentVariant = getABTestVariant();
```

#### `forceABTestVariant(variant)`
Force assign a specific variant for testing.

```tsx
import { forceABTestVariant } from '@/hooks/useABTest';

// Force variant A for testing
forceABTestVariant('A');
```

## Implementation Example

### Onboarding CTA Component

```tsx
import React from 'react';
import { useABTest, clearABTestCookie } from '@/hooks/useABTest';

export function OnboardingCTA() {
  const { variant, isVariantA, isVariantB } = useABTest();

  return (
    <div>
      {isVariantA ? (
        // Variant A: Direct, action-oriented
        <div>
          <h2>Ready to Scale Your Revenue?</h2>
          <button>Get Started Now</button>
        </div>
      ) : (
        // Variant B: Social proof focused
        <div>
          <h2>Trusted by 500+ Agencies</h2>
          <button>Start Your Journey</button>
        </div>
      )}
      
      {/* Development helper */}
      {process.env.NODE_ENV === 'development' && (
        <div>
          <p>Current variant: {variant}</p>
          <button onClick={clearABTestCookie}>
            Clear A/B Test Cookie
          </button>
        </div>
      )}
    </div>
  );
}
```

## Testing

### Development Testing

1. **Clear Cookie**: Use `clearABTestCookie()` to reset assignment
2. **Force Variant**: Use `forceABTestVariant('A')` or `forceABTestVariant('B')`
3. **Console Logs**: Check browser console for assignment logs

### Production Testing

1. **Analytics Integration**: Track variant assignments in your analytics
2. **Conversion Tracking**: Measure conversion rates for each variant
3. **Statistical Significance**: Ensure adequate sample size before drawing conclusions

## Best Practices

### 1. SSR Safety
The hook is designed to be SSR-safe:
- Returns default values during server-side rendering
- Only assigns variants on the client-side
- Prevents hydration mismatches

### 2. Cookie Configuration
- **Name**: `ab_variant`
- **Expiry**: 1 year
- **Security**: Secure in production, lax in development
- **SameSite**: Lax for cross-site compatibility

### 3. Development vs Production
- **Development**: Console logging enabled, testing utilities available
- **Production**: Minimal logging, secure cookie settings

### 4. Analytics Integration

```tsx
import { useABTest } from '@/hooks/useABTest';
import { useEffect } from 'react';

function MyComponent() {
  const { variant } = useABTest();

  useEffect(() => {
    // Track variant assignment
    if (typeof window !== 'undefined') {
      // Google Analytics
      gtag('event', 'ab_test_assignment', {
        variant: variant,
        test_name: 'onboarding_cta'
      });
      
      // Custom analytics
      analytics.track('AB Test Assignment', {
        variant: variant,
        test_name: 'onboarding_cta'
      });
    }
  }, [variant]);

  return <div>...</div>;
}
```

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**: Ensure you're using the hook correctly and not accessing cookies during SSR
2. **Cookie Not Persisting**: Check cookie settings and browser privacy settings
3. **Variant Not Changing**: Clear the cookie and refresh the page

### Debug Mode

Enable debug mode by checking the browser console for:
- `[AB Test] Using existing variant: A`
- `[AB Test] New assignment: B`
- `[AB Test] Cookie cleared - next page load will assign new variant`

## Performance Considerations

- **Lightweight**: Minimal bundle impact
- **No Re-renders**: Variant assignment happens once per session
- **Cookie-based**: No external API calls required
- **SSR Optimized**: No client-side JavaScript required for initial render

## Security Considerations

- **Cookie Security**: Secure flag enabled in production
- **SameSite**: Lax policy for cross-site compatibility
- **No Sensitive Data**: Only stores variant assignment
- **HTTPS**: Secure cookies only in production

## Future Enhancements

Potential improvements for future versions:

1. **Multiple Tests**: Support for multiple concurrent A/B tests
2. **Weighted Distribution**: Custom split ratios (e.g., 70/30)
3. **Segmentation**: User-based variant assignment
4. **Analytics Integration**: Built-in conversion tracking
5. **Admin Panel**: Visual A/B test management interface
