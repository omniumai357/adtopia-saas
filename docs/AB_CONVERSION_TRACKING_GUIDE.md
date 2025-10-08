# A/B Test Conversion Tracking Implementation Guide

## Overview

This guide covers the complete implementation of A/B test conversion tracking in the AdTopia application, including signup completion tracking and drop-off analytics.

## Components Implemented

### 1. Supabase Edge Function: track_ab_conversion

**Location:** `/supabase/functions/track_ab_conversion/index.ts`

**Features:**
- Tracks A/B test conversion events
- Handles signup completion and drop-off tracking
- Validates input data and event types
- Stores comprehensive metadata
- CORS support for frontend integration

**Supported Event Types:**
- `signup_complete` - User successfully completes registration
- `cta_dropoff` - User abandons the form or leaves the page
- `cta_view` - User views the CTA
- `cta_click` - User clicks the CTA button

### 2. Database Schema: ab_tests

**Table:** `ab_tests`

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users (nullable for anonymous users)
- `variant` - A or B
- `event_type` - Type of conversion event
- `timestamp` - Event timestamp
- `metadata` - JSONB for additional event data
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Analytics Views:**
- `ab_test_conversion_analytics` - Conversion rate analysis
- `ab_test_daily_performance` - Daily performance metrics

### 3. Custom Hook: useABConversionTracking

**Location:** `/hooks/useABConversionTracking.ts`

**Features:**
- Integrates with `useABTest` hook
- Provides tracking functions for all event types
- Automatic metadata enrichment
- Error handling and logging

**Available Functions:**
- `trackConversion()` - Generic conversion tracking
- `trackSignupComplete()` - Signup completion tracking
- `trackCTADropoff()` - Form abandonment tracking
- `trackCTAView()` - CTA view tracking
- `trackCTAClick()` - CTA click tracking

### 4. Updated OnboardingEmailForm

**Features:**
- Drop-off tracking on form blur/abandon
- Page unload detection
- Tab switch detection with timeout
- Enhanced CTA click tracking

### 5. AuthCallback Component

**Location:** `/components/AuthCallback.tsx`

**Features:**
- Handles authentication callbacks
- Tracks signup completion automatically
- Redirects users after successful authentication
- Error handling and loading states

## Usage Examples

### Basic Conversion Tracking

```tsx
import { useABConversionTracking } from '@/hooks/useABConversionTracking';

function MyComponent() {
  const { trackSignupComplete, trackCTADropoff } = useABConversionTracking();

  const handleSignup = async (userData) => {
    // Your signup logic here
    
    // Track signup completion
    await trackSignupComplete({
      email: userData.email,
      signup_method: 'email',
      user_metadata: userData
    });
  };

  const handleFormAbandon = async () => {
    await trackCTADropoff({
      dropoff_reason: 'form_abandonment',
      form_state: 'incomplete'
    });
  };

  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

### Authentication Integration

```tsx
import { AuthCallback } from '@/components/AuthCallback';

function AuthPage() {
  const handleSignupComplete = async (user) => {
    // Additional signup completion logic
    console.log('User signed up:', user);
  };

  return (
    <AuthCallback 
      onSignupComplete={handleSignupComplete}
      redirectTo="/dashboard"
    />
  );
}
```

### Form Drop-off Tracking

```tsx
import { useABConversionTracking } from '@/hooks/useABConversionTracking';

function MyForm() {
  const { trackCTADropoff } = useABConversionTracking();

  useEffect(() => {
    const handleBeforeUnload = () => {
      trackCTADropoff({
        dropoff_reason: 'page_unload',
        form_state: 'incomplete'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackCTADropoff]);

  return (
    <form>
      {/* Your form content */}
    </form>
  );
}
```

## Analytics Queries

### Conversion Rate Analysis

```sql
-- Get conversion rates for each variant
SELECT * FROM ab_test_conversion_analytics;

-- Get daily performance metrics
SELECT * FROM ab_test_daily_performance 
WHERE event_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY event_date DESC;
```

### User Journey Analysis

```sql
-- Get complete user journey for a specific user
SELECT 
  user_id,
  variant,
  event_type,
  timestamp,
  metadata
FROM ab_tests 
WHERE user_id = 'user-uuid-here'
ORDER BY timestamp;
```

### Drop-off Analysis

```sql
-- Analyze drop-off reasons
SELECT 
  variant,
  metadata->>'dropoff_reason' as dropoff_reason,
  COUNT(*) as dropoff_count
FROM ab_tests 
WHERE event_type = 'cta_dropoff'
GROUP BY variant, metadata->>'dropoff_reason'
ORDER BY dropoff_count DESC;
```

### Conversion Funnel Analysis

```sql
-- Analyze the complete conversion funnel
WITH funnel_data AS (
  SELECT 
    variant,
    event_type,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_events
  FROM ab_tests
  GROUP BY variant, event_type
)
SELECT 
  variant,
  SUM(CASE WHEN event_type = 'cta_view' THEN unique_users ELSE 0 END) as viewers,
  SUM(CASE WHEN event_type = 'cta_click' THEN unique_users ELSE 0 END) as clickers,
  SUM(CASE WHEN event_type = 'signup_complete' THEN unique_users ELSE 0 END) as signups,
  SUM(CASE WHEN event_type = 'cta_dropoff' THEN unique_users ELSE 0 END) as dropoffs
FROM funnel_data
GROUP BY variant
ORDER BY variant;
```

## Event Metadata

### Standard Metadata Fields

All events automatically include:
- `page_url` - Current page URL
- `referrer` - Page referrer
- `user_agent` - Browser user agent
- `timestamp` - Event timestamp

### Event-Specific Metadata

#### Signup Complete
```json
{
  "email": "user@example.com",
  "signup_method": "email",
  "signup_timestamp": "2025-10-08T15:30:00Z",
  "user_metadata": {},
  "app_metadata": {}
}
```

#### CTA Drop-off
```json
{
  "email": "user@example.com",
  "dropoff_reason": "page_unload",
  "form_state": "incomplete",
  "time_on_page": 45
}
```

#### CTA Click
```json
{
  "email": "user@example.com",
  "click_timestamp": "2025-10-08T15:30:00Z",
  "form_state": "submitting",
  "button_text": "Start Free Trial Now"
}
```

## RLS (Row Level Security) Policies

### Anonymous Users
- Can insert events (for tracking before authentication)
- Cannot view any events

### Authenticated Users
- Can insert their own events
- Can view their own events
- Cannot view other users' events

### Service Role
- Full access for analytics and admin operations
- Can insert, select, update, and delete all events

## Development and Testing

### Testing Conversion Tracking

```tsx
import { useABConversionTracking } from '@/hooks/useABConversionTracking';

function TestComponent() {
  const { trackSignupComplete } = useABConversionTracking();

  const testSignup = async () => {
    await trackSignupComplete({
      email: 'test@example.com',
      signup_method: 'test',
      test_mode: true
    });
  };

  return (
    <button onClick={testSignup}>
      Test Signup Tracking
    </button>
  );
}
```

### Debug Mode

Enable debug logging by checking the browser console for:
- `[AB Test] Conversion tracked: signup_complete for variant A`
- `[AB Test] Conversion tracked: cta_dropoff for variant B`

## Production Deployment

### Environment Variables

Ensure these are set:
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
   supabase functions deploy track_ab_conversion --project-ref your-project-ref
   ```

3. **Deploy the Next.js app:**
   ```bash
   vercel deploy --prod
   ```

## Performance Considerations

### Optimizations

- **Non-blocking tracking** - All tracking calls are asynchronous
- **Error handling** - Tracking failures don't affect user experience
- **Efficient queries** - Indexed database schema for fast analytics
- **Minimal bundle impact** - Lightweight tracking implementation

### Monitoring

- **Error rates** - Monitor tracking function failures
- **Response times** - Ensure fast tracking calls
- **Data quality** - Validate event data integrity

## Security Considerations

### Data Privacy

- **Email masking** - Emails are masked in logs
- **IP anonymization** - Consider IP anonymization for GDPR
- **User consent** - Ensure compliance with privacy laws

### Access Control

- **RLS policies** - Proper data isolation
- **Service role** - Secure admin access
- **Input validation** - Prevent malicious data injection

## Troubleshooting

### Common Issues

1. **Tracking Not Working**
   - Check Supabase function deployment
   - Verify environment variables
   - Check browser console for errors

2. **Missing Events**
   - Verify RLS policies
   - Check user authentication state
   - Validate event data format

3. **Analytics Queries Slow**
   - Check database indexes
   - Optimize query patterns
   - Consider data archiving

### Debug Commands

```bash
# Check function logs
supabase functions logs track_ab_conversion

# Check database events
supabase db shell
SELECT * FROM ab_tests ORDER BY created_at DESC LIMIT 10;

# Check conversion rates
SELECT * FROM ab_test_conversion_analytics;
```

## Future Enhancements

### Potential Improvements

1. **Real-time Analytics** - Live conversion rate updates
2. **Advanced Segmentation** - User-based variant assignment
3. **A/B Test Management** - Admin panel for test configuration
4. **Machine Learning** - Predictive conversion modeling
5. **Multi-variant Testing** - Support for more than 2 variants

### Integration Opportunities

1. **Google Analytics** - Enhanced ecommerce tracking
2. **Mixpanel** - Advanced user journey analysis
3. **Hotjar** - Heatmap analysis by variant
4. **Optimizely** - Professional A/B testing platform
