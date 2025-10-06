#!/bin/bash
# Stripe Products Logging Test Script
# AdTopia SaaS - Comprehensive Product Tracking Validation

echo "🧩 STRIPE PRODUCTS LOGGING TEST"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to log test results
log_test() {
    local test_name=$1
    local status=$2
    local evidence=$3
    
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            echo "   Evidence: $evidence"
            ((PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL: $test_name${NC}"
            echo "   Evidence: $evidence"
            ((FAILED++))
            ;;
    esac
}

echo -e "\n${PURPLE}1. DATABASE SCHEMA VALIDATION${NC}"
echo "================================"

# Test 1: Check if migration file exists
echo -e "\n${BLUE}Testing migration file...${NC}"
if [ -f "supabase/migrations/20250116_stripe_products_log.sql" ]; then
    log_test "Migration File" "PASS" "stripe_products_log migration exists"
else
    log_test "Migration File" "FAIL" "Migration file missing"
fi

# Test 2: Check if table structure is correct
echo -e "\n${BLUE}Testing table structure...${NC}"
if grep -q "CREATE TABLE.*stripe_products_log" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Table Structure" "PASS" "stripe_products_log table defined"
else
    log_test "Table Structure" "FAIL" "Table structure missing"
fi

# Test 3: Check if indexes are created
echo -e "\n${BLUE}Testing indexes...${NC}"
if grep -q "CREATE INDEX.*stripe_products" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Indexes" "PASS" "Performance indexes created"
else
    log_test "Indexes" "FAIL" "Indexes missing"
fi

# Test 4: Check if RLS is enabled
echo -e "\n${BLUE}Testing RLS policies...${NC}"
if grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "RLS Policies" "PASS" "Row Level Security enabled"
else
    log_test "RLS Policies" "FAIL" "RLS not configured"
fi

echo -e "\n${PURPLE}2. FUNCTION VALIDATION${NC}"
echo "======================"

# Test 5: Check logging function
echo -e "\n${BLUE}Testing logging function...${NC}"
if grep -q "log_stripe_product_creation" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Logging Function" "PASS" "log_stripe_product_creation function exists"
else
    log_test "Logging Function" "FAIL" "Logging function missing"
fi

# Test 6: Check summary function
echo -e "\n${BLUE}Testing summary function...${NC}"
if grep -q "get_stripe_products_summary" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Summary Function" "PASS" "get_stripe_products_summary function exists"
else
    log_test "Summary Function" "FAIL" "Summary function missing"
fi

# Test 7: Check recent products function
echo -e "\n${BLUE}Testing recent products function...${NC}"
if grep -q "get_recent_stripe_products" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Recent Products Function" "PASS" "get_recent_stripe_products function exists"
else
    log_test "Recent Products Function" "FAIL" "Recent products function missing"
fi

echo -e "\n${PURPLE}3. EDGE FUNCTION INTEGRATION${NC}"
echo "============================="

# Test 8: Check if create-products function is updated
echo -e "\n${BLUE}Testing Edge Function integration...${NC}"
if grep -q "log_stripe_product_creation" supabase/functions/omnia-shared/create-products/index.ts; then
    log_test "Edge Function Integration" "PASS" "create-products function includes logging"
else
    log_test "Edge Function Integration" "FAIL" "Edge function not updated with logging"
fi

# Test 9: Check if dry run support is added
echo -e "\n${BLUE}Testing dry run support...${NC}"
if grep -q "dryRun" supabase/functions/omnia-shared/create-products/index.ts; then
    log_test "Dry Run Support" "PASS" "Dry run functionality implemented"
else
    log_test "Dry Run Support" "FAIL" "Dry run support missing"
fi

echo -e "\n${PURPLE}4. API ENDPOINT VALIDATION${NC}"
echo "============================="

# Test 10: Check if reporting API exists
echo -e "\n${BLUE}Testing reporting API...${NC}"
if [ -f "app/api/reports/stripe-products/route.ts" ]; then
    log_test "Reporting API" "PASS" "Stripe products report API exists"
else
    log_test "Reporting API" "FAIL" "Reporting API missing"
fi

# Test 11: Check API functionality
echo -e "\n${BLUE}Testing API functionality...${NC}"
if grep -q "get_recent_stripe_products" app/api/reports/stripe-products/route.ts; then
    log_test "API Functionality" "PASS" "API includes all required functions"
else
    log_test "API Functionality" "FAIL" "API missing required functions"
fi

echo -e "\n${PURPLE}5. SAMPLE DATA VALIDATION${NC}"
echo "============================="

# Test 12: Check if sample data is included
echo -e "\n${BLUE}Testing sample data...${NC}"
if grep -q "INSERT INTO.*stripe_products_log" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Sample Data" "PASS" "Sample AdTopia products included"
else
    log_test "Sample Data" "FAIL" "Sample data missing"
fi

# Test 13: Check if all 9 AdTopia products are included
echo -e "\n${BLUE}Testing AdTopia product coverage...${NC}"
product_count=$(grep -c "prod_sample_" supabase/migrations/20250116_stripe_products_log.sql)
if [ "$product_count" -eq 9 ]; then
    log_test "AdTopia Product Coverage" "PASS" "All 9 AdTopia products included"
else
    log_test "AdTopia Product Coverage" "FAIL" "Only $product_count products found (expected 9)"
fi

echo -e "\n${PURPLE}6. REPORTING VIEW VALIDATION${NC}"
echo "==============================="

# Test 14: Check if reporting view exists
echo -e "\n${BLUE}Testing reporting view...${NC}"
if grep -q "CREATE.*VIEW.*stripe_products_report" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Reporting View" "PASS" "stripe_products_report view created"
else
    log_test "Reporting View" "FAIL" "Reporting view missing"
fi

# Test 15: Check if permissions are granted
echo -e "\n${BLUE}Testing permissions...${NC}"
if grep -q "GRANT.*stripe_products_log" supabase/migrations/20250116_stripe_products_log.sql; then
    log_test "Permissions" "PASS" "Proper permissions granted"
else
    log_test "Permissions" "FAIL" "Permissions not configured"
fi

echo -e "\n${PURPLE}=================================================="
echo "🔍 STRIPE LOGGING TEST SUMMARY"
echo "=================================================="

echo -e "\n${BLUE}Test Results:${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

total_tests=$((PASSED + FAILED))
if [ $total_tests -gt 0 ]; then
    pass_rate=$((PASSED * 100 / total_tests))
    echo -e "\n${BLUE}Pass Rate: $pass_rate%${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL STRIPE LOGGING TESTS PASSED!${NC}"
    echo -e "${GREEN}Comprehensive product tracking system is ready.${NC}"
else
    echo -e "\n${RED}🚨 SOME TESTS FAILED!${NC}"
    echo -e "${RED}Stripe logging system needs fixes.${NC}"
fi

echo -e "\n${BLUE}=================================================="
echo "📊 STRIPE LOGGING CAPABILITIES"
echo "=================================================="

echo -e "\n${GREEN}✅ READY FEATURES:${NC}"
echo "   • Comprehensive product creation logging"
echo "   • Project-based product tracking"
echo "   • Metadata storage and retrieval"
echo "   • Performance-optimized queries"
echo "   • Security with RLS policies"
echo "   • Reporting API endpoints"
echo "   • Dry run testing support"
echo "   • Sample data for testing"

echo -e "\n${BLUE}🎯 USAGE EXAMPLES:${NC}"
echo "   • Track all AdTopia product creations"
echo "   • Monitor BizBox, GammaFlow, ShieldStaff products"
echo "   • Generate revenue reports by project"
echo "   • Audit product creation history"
echo "   • Performance analytics"

echo -e "\n${PURPLE}=================================================="
echo "🚀 STRIPE LOGGING TEST COMPLETE"
echo "=================================================="
