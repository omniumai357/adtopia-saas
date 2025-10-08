# A/B Testing System Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run `ab_tests` table migration
- [ ] Run `feature_flags` table migration
- [ ] Run `ab_test_analysis_functions` migration
- [ ] Verify all indexes are created
- [ ] Test RLS policies
- [ ] Insert default feature flag (`ab_test_active: true`)

### 2. Supabase Edge Functions
- [ ] Deploy `track_ab_conversion` function
- [ ] Deploy `get_ab_test_analytics` function
- [ ] Deploy `send-admin-notification` function
- [ ] Test function endpoints
- [ ] Verify CORS headers
- [ ] Check function logs

### 3. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
- [ ] `RESEND_API_KEY` configured
- [ ] All variables tested in development

### 4. Frontend Dependencies
- [ ] `recharts` installed for charting
- [ ] `framer-motion` installed for animations
- [ ] `js-cookie` installed for cookie management
- [ ] All TypeScript types resolved
- [ ] No linting errors

### 5. Component Integration
- [ ] `useABTest` hook tested
- [ ] `useABConversionTracking` hook tested
- [ ] `OnboardingEmailForm` component tested
- [ ] `AuthCallback` component tested
- [ ] Admin dashboard A/B test monitor tested

## Deployment Steps

### 1. Database Deployment
```bash
# Navigate to project directory
cd /path/to/adtopia-saas

# Run migrations
supabase db push

# Verify migrations
supabase db shell
\dt ab_tests
\dt feature_flags
\dv ab_test_summary
```

### 2. Edge Functions Deployment
```bash
# Deploy all functions
supabase functions deploy track_ab_conversion
supabase functions deploy get_ab_test_analytics
supabase functions deploy send-admin-notification

# Test functions
curl -X POST https://your-project.supabase.co/functions/v1/track_ab_conversion \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"variant":"A","event_type":"cta_view"}'
```

### 3. Frontend Deployment
```bash
# Install dependencies
npm install

# Build and test locally
npm run build
npm run start

# Deploy to Vercel
vercel deploy --prod
```

### 4. Admin Access Setup
```bash
# Ensure admin user has proper role
supabase db shell
INSERT INTO user_roles (user_id, role) 
VALUES ('admin-user-id', 'admin') 
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Post-Deployment Verification

### 1. A/B Testing Functionality
- [ ] Test variant assignment (clear cookies, refresh page)
- [ ] Verify cookie persistence across sessions
- [ ] Test both variants render correctly
- [ ] Check console logs for assignment tracking

### 2. Conversion Tracking
- [ ] Test CTA view tracking
- [ ] Test CTA click tracking
- [ ] Test signup completion tracking
- [ ] Test drop-off tracking (form abandonment)
- [ ] Verify data appears in `ab_tests` table

### 3. Admin Dashboard
- [ ] Access admin dashboard at `/admin`
- [ ] Verify A/B test monitor section loads
- [ ] Check test status indicator (Active/Inactive)
- [ ] Verify results table displays data
- [ ] Test bar chart renders correctly
- [ ] Check winner recommendation logic

### 4. Analytics and Reporting
- [ ] Run analytics queries manually
- [ ] Verify statistical significance calculations
- [ ] Test winner recommendation algorithm
- [ ] Check email notification system
- [ ] Verify feature flag updates work

### 5. Security and Permissions
- [ ] Test RLS policies (try accessing as non-admin)
- [ ] Verify admin-only access to dashboard
- [ ] Test feature flag permissions
- [ ] Check data isolation between users

## Monitoring and Maintenance

### 1. Regular Monitoring
- [ ] Check conversion rates daily
- [ ] Monitor error rates in function logs
- [ ] Review statistical significance weekly
- [ ] Check email delivery success rates

### 2. Performance Monitoring
- [ ] Monitor database query performance
- [ ] Check Edge Function response times
- [ ] Monitor frontend bundle size
- [ ] Track user experience metrics

### 3. Data Quality
- [ ] Verify event data integrity
- [ ] Check for duplicate events
- [ ] Monitor data completeness
- [ ] Review metadata accuracy

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. A/B Test Not Working
**Symptoms:** Same variant always shows, no tracking
**Solutions:**
- Clear browser cookies
- Check `useABTest` hook implementation
- Verify cookie settings
- Check console for errors

#### 2. Tracking Not Recording
**Symptoms:** No data in `ab_tests` table
**Solutions:**
- Check Supabase function deployment
- Verify environment variables
- Check RLS policies
- Review function logs

#### 3. Admin Dashboard Not Loading
**Symptoms:** Dashboard shows no data or errors
**Solutions:**
- Verify admin role assignment
- Check RLS policies for `ab_test_summary` view
- Verify database migrations completed
- Check browser console for errors

#### 4. Email Notifications Not Sending
**Symptoms:** No emails received on test completion
**Solutions:**
- Check `RESEND_API_KEY` configuration
- Verify email addresses in notification function
- Check function logs for errors
- Test Resend API directly

### Debug Commands

```bash
# Check function logs
supabase functions logs track_ab_conversion --follow

# Check database status
supabase db shell
SELECT COUNT(*) FROM ab_tests;
SELECT * FROM feature_flags WHERE flag_name = 'ab_test_active';

# Check analytics view
SELECT * FROM ab_test_summary;

# Test Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/track_ab_conversion \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"variant":"A","event_type":"cta_view","metadata":{"test":true}}'
```

## Success Criteria

### 1. Functional Requirements
- [ ] A/B test variants display correctly
- [ ] User assignment persists across sessions
- [ ] All conversion events are tracked
- [ ] Admin dashboard shows real-time data
- [ ] Statistical analysis is accurate
- [ ] Winner recommendations work correctly

### 2. Performance Requirements
- [ ] Page load times < 2 seconds
- [ ] Tracking calls complete < 500ms
- [ ] Database queries execute < 100ms
- [ ] Admin dashboard loads < 3 seconds

### 3. Security Requirements
- [ ] RLS policies prevent unauthorized access
- [ ] Admin functions require proper authentication
- [ ] User data is properly isolated
- [ ] Feature flags are secure

### 4. Reliability Requirements
- [ ] 99.9% uptime for tracking functions
- [ ] < 0.1% error rate for tracking calls
- [ ] Data integrity maintained
- [ ] Email notifications delivered successfully

## Rollback Plan

### If Issues Occur
1. **Disable A/B Testing**
   ```sql
   UPDATE feature_flags 
   SET flag_value = 'false', is_active = false 
   WHERE flag_name = 'ab_test_active';
   ```

2. **Revert to Default Variant**
   - Update `useABTest` hook to always return 'A'
   - Deploy frontend changes

3. **Database Rollback**
   ```bash
   supabase db reset --seed
   ```

4. **Function Rollback**
   ```bash
   supabase functions deploy track_ab_conversion --version previous
   ```

## Support and Maintenance

### Regular Tasks
- [ ] Weekly analytics review
- [ ] Monthly performance optimization
- [ ] Quarterly security audit
- [ ] Annual system upgrade planning

### Contact Information
- **Development Team:** [Your team contact]
- **Supabase Support:** [Supabase support channels]
- **Vercel Support:** [Vercel support channels]

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Version:** 1.0  
**Status:** ✅ Ready for Production
