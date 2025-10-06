#!/bin/bash
echo "🔍 Running AdTopia preflight verification..."

# Check Stripe authentication
if stripe whoami 2>/dev/null | grep -q "Omnia Group LLC"; then
    echo "✅ Stripe Live Auth OK"
else
    echo "⚠️ Stripe context mismatch - ensure you're in Omnia Group LLC account"
fi

# Check Supabase secrets
if supabase secrets list 2>/dev/null | grep -q "STRIPE_SECRET_KEY"; then
    echo "✅ Supabase Key OK"
else
    echo "⚠️ Missing Supabase Stripe key"
fi

# Check Vercel environment
if vercel env ls 2>/dev/null | grep -q "STRIPE_SECRET_KEY"; then
    echo "✅ Vercel Env OK"
else
    echo "⚠️ Missing Vercel Stripe env"
fi

# Check Supabase project link
if supabase status 2>/dev/null | grep -q "Linked project"; then
    echo "✅ Supabase Project Linked"
else
    echo "⚠️ Supabase project not linked"
fi

# Check Vercel project
if vercel ls 2>/dev/null | grep -q "adtopia-saas"; then
    echo "✅ Vercel Project OK"
else
    echo "⚠️ Vercel project not found"
fi

echo "Preflight complete."
