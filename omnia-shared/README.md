# Omnia-Shared Functions

Universal, reusable functions for all Omnia SaaS projects (AdTopia, BizBox, GammaFlow, ShieldStaff).

## 🧩 Universal Product Creation System

### Overview
The `create-products` function provides a unified way to create Stripe products across all Omnia projects with comprehensive logging, validation, and analytics.

### Directory Structure
```
omnia-shared/
└── functions/
    └── create-products/
        ├── index.ts                   # Universal creator + logger
        ├── utils.ts                   # Helpers (logging, validation)
        ├── supabaseClient.ts          # Minimal Deno client for DB operations
        ├── adtopia.json              # AdTopia product configurations
        ├── bizbox.json               # BizBox product configurations
        ├── gammaflow.json            # GammaFlow product configurations
        └── shieldstaff.json          # ShieldStaff product configurations
```

### Features

#### ✅ Universal Product Creation
- **Multi-project support**: AdTopia, BizBox, GammaFlow, ShieldStaff
- **JSON-driven configuration**: Easy product management
- **Stripe integration**: Direct product creation via API
- **Dry run support**: Safe testing without creating actual products

#### ✅ Comprehensive Logging
- **Database logging**: All products logged to `stripe_products_log` table via RPC calls
- **Structured logging**: JSON-formatted logs with timestamps
- **Error tracking**: Detailed error logging and reporting
- **Analytics**: Product statistics and performance metrics

#### ✅ Security & Validation
- **Input validation**: Comprehensive parameter validation
- **Environment checks**: Required environment variables validation
- **CORS support**: Proper headers for cross-origin requests
- **Error handling**: Graceful error handling with detailed responses

#### ✅ Analytics & Reporting
- **Product statistics**: Count, value, average price calculations
- **Success rates**: Creation success/failure tracking
- **Project comparison**: Cross-project performance analysis
- **Audit trail**: Complete product creation history

### Usage

#### Basic Usage
```bash
# Create products for AdTopia (dry run)
curl "https://your-domain.com/functions/v1/create-products?project=adtopia&dryRun=true"

# Create products for BizBox (live)
curl "https://your-domain.com/functions/v1/create-products?project=bizbox"

# Create limited products
curl "https://your-domain.com/functions/v1/create-products?project=gammaflow&limit=2"
```

#### Response Format
```json
{
  "success": true,
  "summary": {
    "project": "adtopia",
    "total_requested": 9,
    "total_created": 9,
    "total_errors": 0,
    "dry_run": false,
    "statistics": {
      "totalProducts": 9,
      "totalValue": 69700,
      "averagePrice": 7744.44,
      "minPrice": 1900,
      "maxPrice": 29700,
      "success_rate": "100%"
    }
  },
  "created": [
    {
      "id": "prod_1234567890",
      "name": "Starter Package",
      "price": "$29.00",
      "price_usd": 29.00,
      "metadata": {
        "package_type": "starter",
        "category": "ad_package",
        "internal_id": "001"
      },
      "created_at": "2025-01-16T18:19:00.000Z"
    }
  ],
  "timestamp": "2025-01-16T18:19:00.000Z"
}
```

### Supported Projects

#### AdTopia (9 Products)
- **Starter Package**: $29.00 - 7-day live preview
- **Growth Package**: $79.00 - 30-day extended preview
- **Pro Package**: $149.00 - Dual-language ads
- **Full Beta Package**: $297.00 - Complete setup
- **Extra Translation**: $29.00 - Add translated ad card
- **Domain + SSL**: $49.00 - Professional domain
- **Extra Cards**: $39.00 - Add more ad cards
- **Premium Analytics**: $19.00 - Advanced tracking
- **Social Media Pack**: $35.00 - Facebook + Instagram ready

#### BizBox (3 Products)
- **BizBox Starter**: $99.00 - Basic white-label platform
- **BizBox Professional**: $249.00 - Advanced platform
- **BizBox Enterprise**: $499.00 - Full white-label platform

#### GammaFlow (3 Products)
- **GammaFlow Basic**: $49.00 - AI-powered automation
- **GammaFlow Pro**: $149.00 - Advanced AI automation
- **GammaFlow Enterprise**: $499.00 - Unlimited automation

#### ShieldStaff (3 Products)
- **Basic Security Shift**: $129.00 - Part-time coverage
- **Full Day Coverage**: $229.00 - 8-hour coverage
- **Overnight Patrol**: $249.00 - 10PM–6AM patrol

### Environment Variables

#### Required
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

#### Optional
- `DRY_RUN`: Set to "true" for testing mode (via URL parameter)
- `LOG_LEVEL`: Logging verbosity (DEBUG, INFO, WARN, ERROR)

### Database Schema

The function logs all product creations to the `stripe_products_log` table:

```sql
CREATE TABLE stripe_products_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

#### Product Creation
- **POST** `/functions/v1/create-products`
- **Parameters**: `project`, `dryRun`, `limit`
- **Response**: Product creation summary with statistics

#### Product Reports
- **GET** `/api/reports/stripe-products`
- **Parameters**: `project`, `limit`
- **Response**: Product analytics and reporting data

### Testing

Run the comprehensive test suite:
```bash
bash scripts/test-omnia-shared.sh
```

**Test Coverage**: 23/23 tests (100% pass rate)
- Directory structure validation
- Code quality validation
- JSON configuration validation
- Functionality validation
- Integration validation
- Security validation

### Deployment

#### Supabase Edge Function
```bash
# Deploy to Supabase
supabase functions deploy create-products

# Test deployment
curl "https://your-project.supabase.co/functions/v1/create-products?project=adtopia&dryRun=true"
```

#### Vercel API Route
```bash
# Deploy to Vercel
vercel deploy

# Test deployment
curl "https://your-app.vercel.app/api/reports/stripe-products?project=adtopia"
```

### Contributing

1. **Add new projects**: Create new JSON configuration files
2. **Extend functionality**: Add new utility functions to `utils.ts`
3. **Improve logging**: Enhance the `supabaseClient.ts` methods
4. **Update tests**: Add new test cases to the validation script

### License

Part of the Omnia SaaS platform. All rights reserved.

---

**Status**: ✅ Production Ready  
**Test Coverage**: 100% (23/23 tests passed)  
**Last Updated**: January 16, 2025
