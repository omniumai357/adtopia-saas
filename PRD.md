# AdTopia SaaS - Product Requirements Document

## Overview
AdTopia SaaS is a comprehensive QR code advertising platform that enables businesses to create, manage, and track QR code campaigns with advanced analytics and multi-language support.

## Core Features

### QR Code Generation
- Custom QR code creation with business branding
- Multiple format support (PNG, SVG, PDF)
- High-resolution output for print and digital use
- Batch generation for multiple campaigns

### Campaign Management
- Multi-language support (English, Spanish, French, German)
- Campaign scheduling and automation
- A/B testing capabilities
- Performance tracking and analytics

### Analytics Dashboard
- Real-time campaign performance metrics
- Click-through rate analysis
- Geographic distribution tracking
- Device and browser analytics
- Conversion tracking and ROI analysis

## Revenue Generation System

### Stripe Integration
- Payment processing for all AdTopia packages
- Webhook handling for purchase confirmations
- Automatic access level assignment
- Comprehensive transaction logging

### Real-Time UUID Flow
- **Email to UUID Lookup**: `SELECT id FROM auth.users WHERE email = '<email>' LIMIT 1;`
- **Idempotent Role Inserts**: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin') ON CONFLICT DO NOTHING;`
- **Webhook Triggers**: Stripe checkout.completed → extract customer_email → UUID fetch → upsert user_access/role
- **Auth Triggers**: User signup → trigger grant_default_user_role() → auto-grant 'user' role
- **Performance**: All operations < 50ms, webhook processing < 100ms
- **Security**: SECURITY DEFINER functions, RLS policies, service role bypass

### Package Tiers
1. **Starter Package** - $29
   - 7-day live preview
   - QR code generation
   - Mobile responsive design
   - Email support

2. **Growth Package** - $79
   - 30-day extended preview
   - Domain hold
   - SSL setup
   - Priority email support

3. **Pro Package** - $149
   - Dual-language ads
   - Priority setup
   - Advanced analytics
   - Phone support

4. **Full Beta Package** - $297
   - 5 custom SEO ad cards
   - 12 months hosting
   - Free domain + SSL
   - Dual-language support
   - Premium analytics and support

### Add-On Services
- **Extra Translation** - $29
- **Domain + SSL** - $49
- **Extra Cards** - $39
- **Premium Analytics** - $19
- **Social Media Pack** - $35

## Technical Architecture

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Responsive design for all devices
- Progressive Web App capabilities

### Backend
- Supabase for database and authentication
- Edge Functions for serverless processing
- Stripe for payment processing
- Real-time subscriptions for live updates

### Database Schema
- User management with UUID-based roles
- Campaign and QR code storage
- Analytics and performance tracking
- Transaction and payment logging

### Security
- Row Level Security (RLS) policies
- JWT-based authentication
- API rate limiting
- Data encryption at rest and in transit

## User Experience

### Onboarding Flow
1. User visits landing page
2. Selects package tier
3. Completes Stripe checkout
4. Automatic account creation
5. Access granted based on package
6. Welcome email with next steps

### Dashboard Features
- Campaign overview and management
- QR code generation tools
- Analytics and reporting
- Account settings and billing

### Mobile Experience
- Responsive design for all screen sizes
- Touch-optimized interface
- Offline capability for basic functions
- Push notifications for campaign updates

## Performance Requirements

### Response Times
- Page load: < 2 seconds
- QR code generation: < 5 seconds
- Database queries: < 50ms
- Webhook processing: < 100ms

### Scalability
- Support for 10,000+ concurrent users
- Handle 100,000+ QR code generations per day
- 99.9% uptime SLA
- Auto-scaling infrastructure

## Success Metrics

### Revenue Targets
- Month 1: $5,000 MRR
- Month 3: $15,000 MRR
- Month 6: $30,000 MRR
- Year 1: $100,000 ARR

### User Engagement
- 80% user retention after 30 days
- 60% upgrade rate from Starter to Growth
- 40% referral rate
- 4.5+ star average rating

## Implementation Timeline

### Phase 1 (Weeks 1-2)
- Core platform setup
- Basic QR code generation
- Stripe integration
- User authentication

### Phase 2 (Weeks 3-4)
- Advanced analytics
- Multi-language support
- Campaign management
- Performance optimization

### Phase 3 (Weeks 5-6)
- Mobile optimization
- Advanced features
- Testing and QA
- Production deployment

## Risk Mitigation

### Technical Risks
- Database performance optimization
- Payment processing reliability
- Security vulnerability management
- Scalability planning

### Business Risks
- Market competition analysis
- Customer acquisition strategy
- Pricing optimization
- Feature prioritization

## Future Enhancements

### Advanced Features
- AI-powered campaign optimization
- Advanced analytics and insights
- White-label solutions
- API for third-party integrations

### Market Expansion
- International market support
- Enterprise features
- Partner integrations
- Mobile app development
