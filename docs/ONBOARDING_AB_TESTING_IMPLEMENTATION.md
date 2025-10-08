# Onboarding A/B Testing Implementation Guide

## Overview

This guide covers the complete implementation of A/B testing for the AdTopia onboarding email form, including the updated component, Supabase tracking, and analytics.

## Components Updated

### 1. OnboardingEmailForm.tsx

**Features:**
- A/B test integration with `useABTest` hook
- Conditional CTA button rendering based on variant
- Framer Motion animations
- Supabase tracking for variant exposure and clicks
- Email validation and form submission
- Development mode indicators

**A/B Test Variants:**

#### Variant A (Blue Button)
- **Color:** `#3B82F6` (blue-600)
- **Text:** "Start Free Trial Now"
- **Style:** Full-width blue button
- **Animation:** Subtle scale on hover/tap

#### Variant B (Green Button)
- **Color:** `#10B981` (green-600)
- **Text:** "Join Top Agencies – Free!"
- **Badge:** "Limited Spots" (yellow badge)
- **Style:** Full-width green button with positioned badge
- **Animation:** Fade-in with delay, scale on hover/tap

### 2. Supabase Edge Function: track_ab_exposure

**Location:** `/supabase/functions/track_ab_exposure/index.ts`

**Features:**
- Tracks variant exposure (`cta_view`) and clicks (`cta_click`)
- Handles both authenticated and anonymous users
- Validates input data
- Stores comprehensive event data
- CORS support for frontend integration

**Event Data Stored:**
- `user_id` (optional for anonymous users)
- `variant` (A or B)
- `event_type` (cta_view or cta_click)
- `email` (for click events)
- `session_id` (generated for anonymous users)
- `user_agent` and `ip_address` (for analytics)
- `timestamp` (event creation time)

### 3. Database Schema

**Table:** `ab_test_events`

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users (nullable)
- `variant` - A or B
- `event_type` - cta_view or cta_click
- `email` - User email (for click events)
- `session_id` - Unique session identifier
- `user_agent` - Browser information
- `ip_address` - User IP address
- `created_at` - Event timestamp
- `updated_at` - Last update timestamp

**Analytics Views:**
- `ab_test_analytics` - Aggregated event counts by variant and type
- `ab_test_conversion_rates` - Conversion rate calculations

## Usage Examples

### Basic Implementation

```tsx
import { OnboardingEmailForm } from '@/components/OnboardingEmailForm';

function OnboardingPage() {
  const handleEmailSubmit = async (email: string) => {
    // Handle email submission logic
    console.log('Email submitted:', email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to AdTopia
        </h1>
        <OnboardingEmailForm onSubmit={handleEmailSubmit} />
      </div>
    </div>
  );
}
```

### Custom Styling

```tsx
<OnboardingEmailForm 
  onSubmit={handleEmailSubmit}
  className="bg-white p-8 rounded-lg shadow-lg"
/>
```

## Analytics and Tracking

### Automatic Tracking

The component automatically tracks:
1. **Variant Exposure** - When the component mounts
2. **CTA Clicks** - When the form is submitted

### Manual Tracking

```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Track custom events
await supabase.functions.invoke('track_ab_exposure', {
  body: {
    user_id: user?.id || null,
    variant: 'A',
    event: 'custom_event',
    timestamp: new Date().toISOString()
  }
});
```

### Analytics Queries

#### Get Conversion Rates
```sql
SELECT * FROM ab_test_conversion_rates;
```

#### Get Daily Analytics
```sql
SELECT * FROM ab_test_analytics 
WHERE event_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY event_date DESC;
```

#### Get User Journey
```sql
SELECT 
  user_id,
  variant,
  event_type,
  created_at
FROM ab_test_events 
WHERE user_id = 'user-uuid-here'
ORDER BY created_at;
```

## Development and Testing

### Testing Different Variants

```tsx
import { forceABTestVariant, clearABTestCookie } from '@/hooks/useABTest';

// Force variant A
forceABTestVariant('A');

// Force variant B
forceABTestVariant('B');

// Clear cookie to get random assignment
clearABTestCookie();
```

### Development Mode Features

- **Variant Indicator** - Shows current variant in development
- **Console Logging** - Logs tracking events
- **Visual Feedback** - Clear indication of which variant is active

### Local Testing

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy track_ab_exposure
   ```

3. **Run the migration:**
   ```bash
   supabase db reset
   ```

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Edge Function)

### Deployment Steps

1. **Deploy the migration:**
   ```bash
   supabase db push
   ```

2. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy track_ab_exposure --project-ref your-project-ref
   ```

3. **Deploy the Next.js app:**
   ```bash
   vercel deploy --prod
   ```

## Performance Considerations

### Optimizations

- **Lazy Loading** - Component only loads when needed
- **Minimal Re-renders** - Variant assignment happens once
- **Efficient Tracking** - Non-blocking analytics calls
- **SSR Safe** - No hydration mismatches

### Bundle Size

- **Framer Motion** - ~13KB gzipped
- **js-cookie** - ~2KB gzipped
- **Total Impact** - Minimal addition to bundle

## Security Considerations

### Data Privacy

- **Email Masking** - Emails are masked in logs
- **IP Anonymization** - Consider IP anonymization for GDPR
- **User Consent** - Ensure compliance with privacy laws

### RLS Policies

- Users can only view their own events
- Service role has full access for analytics
- Anonymous users are tracked via session ID

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Conversion Rates** - Track variant performance
2. **Error Rates** - Monitor tracking failures
3. **Response Times** - Ensure fast user experience
4. **Data Quality** - Validate event data integrity

### Alert Thresholds

- **Conversion Rate Drop** - >20% decrease
- **Error Rate Increase** - >5% tracking failures
- **Response Time** - >2s for form submission

## Troubleshooting

### Common Issues

1. **Tracking Not Working**
   - Check Supabase function deployment
   - Verify environment variables
   - Check browser console for errors

2. **Variant Not Changing**
   - Clear browser cookies
   - Use `clearABTestCookie()` function
   - Check cookie settings

3. **Animation Issues**
   - Ensure Framer Motion is installed
   - Check for CSS conflicts
   - Verify component mounting

### Debug Commands

```bash
# Check Supabase function logs
supabase functions logs track_ab_exposure

# Check database events
supabase db shell
SELECT * FROM ab_test_events ORDER BY created_at DESC LIMIT 10;

# Check conversion rates
SELECT * FROM ab_test_conversion_rates;
```

## Future Enhancements

### Potential Improvements

1. **Multi-Variant Testing** - Support for more than 2 variants
2. **Weighted Distribution** - Custom split ratios
3. **Segmentation** - User-based variant assignment
4. **Real-time Analytics** - Live conversion rate updates
5. **A/B Test Management** - Admin panel for test configuration

### Integration Opportunities

1. **Google Analytics** - Enhanced ecommerce tracking
2. **Mixpanel** - Advanced user journey analysis
3. **Hotjar** - Heatmap analysis by variant
4. **Optimizely** - Professional A/B testing platform
