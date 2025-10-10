# 🔑 Gamma Gallery Migration - API Key Configuration Guide

## Required API Keys

### 1. Supabase Service Role Key
- **Location**: Supabase Dashboard → Settings → API
- **Key Type**: `service_role` (not `anon`)
- **Purpose**: Upload files to storage and insert database records

### 2. Gamma API Key
- **Location**: Gamma Dashboard → API Keys
- **Purpose**: Generate new cards from existing URLs
- **Cost**: ~$0.50 per generation

## Configuration Steps

### Step 1: Create .env file
```bash
cd scripts/gamma-migration
cp .env.template .env
```

### Step 2: Edit .env file
```bash
nano .env
```

### Step 3: Add your API keys
```env
# Supabase Configuration
SUPABASE_URL=https://auyjsmtnfnnapjdrzhea.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Gamma API Configuration
GAMMA_API_KEY=your_actual_gamma_api_key_here
```

### Step 4: Verify configuration
```bash
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('SUPABASE_URL:', os.getenv('SUPABASE_URL'))
print('GAMMA_API_KEY configured:', bool(os.getenv('GAMMA_API_KEY')))
"
```

## API Key Sources

### Supabase Service Role Key
1. Go to: https://supabase.com/dashboard/project/auyjsmtnfnnapjdrzhea/settings/api
2. Copy the `service_role` key (starts with `eyJ...`)
3. Paste into `.env` file

### Gamma API Key
1. Go to: https://gamma.app/dashboard/api
2. Create new API key
3. Copy the key
4. Paste into `.env` file

## Security Notes
- Never commit `.env` file to git
- Use service role key only for server-side operations
- Keep API keys secure and rotate regularly
