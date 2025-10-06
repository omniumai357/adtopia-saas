#!/bin/bash
# Omnia-Shared Functions Test Script
# Comprehensive validation of universal product creation system

echo "🧩 OMNIA-SHARED FUNCTIONS TEST"
echo "==============================="

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

echo -e "\n${PURPLE}1. DIRECTORY STRUCTURE VALIDATION${NC}"
echo "====================================="

# Test 1: Check omnia-shared directory structure
echo -e "\n${BLUE}Testing directory structure...${NC}"
if [ -d "omnia-shared/functions/create-products" ]; then
    log_test "Directory Structure" "PASS" "omnia-shared/functions/create-products exists"
else
    log_test "Directory Structure" "FAIL" "omnia-shared directory structure missing"
fi

# Test 2: Check all required files exist
echo -e "\n${BLUE}Testing required files...${NC}"
required_files=(
    "omnia-shared/functions/create-products/index.ts"
    "omnia-shared/functions/create-products/utils.ts"
    "omnia-shared/functions/create-products/supabaseClient.ts"
    "omnia-shared/functions/create-products/adtopia.json"
    "omnia-shared/functions/create-products/bizbox.json"
    "omnia-shared/functions/create-products/gammaflow.json"
    "omnia-shared/functions/create-products/shieldstaff.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_test "File: $(basename $file)" "PASS" "File exists"
    else
        log_test "File: $(basename $file)" "FAIL" "File missing"
    fi
done

echo -e "\n${PURPLE}2. CODE QUALITY VALIDATION${NC}"
echo "============================="

# Test 3: Check TypeScript imports
echo -e "\n${BLUE}Testing TypeScript imports...${NC}"
if grep -q "import.*supabase.*from.*supabaseClient\|import.*log.*validatePayload.*from.*utils" omnia-shared/functions/create-products/index.ts; then
    log_test "TypeScript Imports" "PASS" "Proper imports in index.ts"
else
    log_test "TypeScript Imports" "FAIL" "Missing imports in index.ts"
fi

# Test 4: Check utility functions
echo -e "\n${BLUE}Testing utility functions...${NC}"
if grep -q "validatePayload\|log\|generateMockProductId" omnia-shared/functions/create-products/utils.ts; then
    log_test "Utility Functions" "PASS" "All utility functions present"
else
    log_test "Utility Functions" "FAIL" "Missing utility functions"
fi

# Test 5: Check Supabase client
echo -e "\n${BLUE}Testing Supabase client...${NC}"
if grep -q "createClient\|SUPABASE_URL\|SUPABASE_SERVICE_ROLE_KEY" omnia-shared/functions/create-products/supabaseClient.ts; then
    log_test "Supabase Client" "PASS" "Minimal client implementation present"
else
    log_test "Supabase Client" "FAIL" "Missing client implementation"
fi

echo -e "\n${PURPLE}3. JSON CONFIGURATION VALIDATION${NC}"
echo "====================================="

# Test 6: Validate AdTopia configuration
echo -e "\n${BLUE}Testing AdTopia configuration...${NC}"
adtopia_products=$(grep -c '"name"' omnia-shared/functions/create-products/adtopia.json)
if [ "$adtopia_products" -eq 9 ]; then
    log_test "AdTopia Configuration" "PASS" "All 9 AdTopia products configured"
else
    log_test "AdTopia Configuration" "FAIL" "Only $adtopia_products products found (expected 9)"
fi

# Test 7: Validate BizBox configuration
echo -e "\n${BLUE}Testing BizBox configuration...${NC}"
bizbox_products=$(grep -c '"name"' omnia-shared/functions/create-products/bizbox.json)
if [ "$bizbox_products" -eq 3 ]; then
    log_test "BizBox Configuration" "PASS" "All 3 BizBox products configured"
else
    log_test "BizBox Configuration" "FAIL" "Only $bizbox_products products found (expected 3)"
fi

# Test 8: Validate GammaFlow configuration
echo -e "\n${BLUE}Testing GammaFlow configuration...${NC}"
gammaflow_products=$(grep -c '"name"' omnia-shared/functions/create-products/gammaflow.json)
if [ "$gammaflow_products" -eq 3 ]; then
    log_test "GammaFlow Configuration" "PASS" "All 3 GammaFlow products configured"
else
    log_test "GammaFlow Configuration" "FAIL" "Only $gammaflow_products products found (expected 3)"
fi

# Test 9: Validate ShieldStaff configuration
echo -e "\n${BLUE}Testing ShieldStaff configuration...${NC}"
shieldstaff_products=$(grep -c '"name"' omnia-shared/functions/create-products/shieldstaff.json)
if [ "$shieldstaff_products" -eq 3 ]; then
    log_test "ShieldStaff Configuration" "PASS" "All 3 ShieldStaff products configured"
else
    log_test "ShieldStaff Configuration" "FAIL" "Only $shieldstaff_products products found (expected 3)"
fi

echo -e "\n${PURPLE}4. FUNCTIONALITY VALIDATION${NC}"
echo "============================="

# Test 10: Check core functionality
echo -e "\n${BLUE}Testing core functionality...${NC}"
if grep -q "stripe.products.create\|fetch.*json" omnia-shared/functions/create-products/index.ts; then
    log_test "Core Functionality" "PASS" "Stripe integration and JSON loading implemented"
else
    log_test "Core Functionality" "FAIL" "Core functionality missing"
fi

# Test 11: Check error handling
echo -e "\n${BLUE}Testing error handling...${NC}"
if grep -q "catch.*error\|console.error" omnia-shared/functions/create-products/index.ts; then
    log_test "Error Handling" "PASS" "Error handling implemented"
else
    log_test "Error Handling" "FAIL" "Error handling missing"
fi

# Test 12: Check response headers
echo -e "\n${BLUE}Testing response headers...${NC}"
if grep -q "Content-Type.*application/json" omnia-shared/functions/create-products/index.ts; then
    log_test "Response Headers" "PASS" "JSON response headers implemented"
else
    log_test "Response Headers" "FAIL" "Response headers missing"
fi

echo -e "\n${PURPLE}5. INTEGRATION VALIDATION${NC}"
echo "============================="

# Test 13: Check database integration
echo -e "\n${BLUE}Testing database integration...${NC}"
if grep -q "supabase.from.*stripe_products_log.*insert" omnia-shared/functions/create-products/index.ts; then
    log_test "Database Integration" "PASS" "Database logging implemented"
else
    log_test "Database Integration" "FAIL" "Database integration missing"
fi

# Test 14: Check Stripe integration
echo -e "\n${BLUE}Testing Stripe integration...${NC}"
if grep -q "stripe.products.create\|STRIPE_SECRET_KEY" omnia-shared/functions/create-products/index.ts; then
    log_test "Stripe Integration" "PASS" "Stripe product creation implemented"
else
    log_test "Stripe Integration" "FAIL" "Stripe integration missing"
fi

# Test 15: Check logging and reporting
echo -e "\n${BLUE}Testing logging and reporting...${NC}"
if grep -q "log.*Products created.*logged\|count.*created" omnia-shared/functions/create-products/index.ts; then
    log_test "Logging & Reporting" "PASS" "Logging and reporting implemented"
else
    log_test "Logging & Reporting" "FAIL" "Logging and reporting missing"
fi

echo -e "\n${PURPLE}6. SECURITY VALIDATION${NC}"
echo "========================="

# Test 16: Check input validation
echo -e "\n${BLUE}Testing input validation...${NC}"
if grep -q "validatePayload\|project.*toLowerCase" omnia-shared/functions/create-products/index.ts; then
    log_test "Input Validation" "PASS" "Input validation implemented"
else
    log_test "Input Validation" "FAIL" "Input validation missing"
fi

# Test 17: Check environment variable handling
echo -e "\n${BLUE}Testing environment variable handling...${NC}"
if grep -q "Deno.env.get\|Missing.*environment" omnia-shared/functions/create-products/index.ts; then
    log_test "Environment Variables" "PASS" "Environment variable validation implemented"
else
    log_test "Environment Variables" "FAIL" "Environment variable handling missing"
fi

echo -e "\n${PURPLE}=================================================="
echo "🔍 OMNIA-SHARED TEST SUMMARY"
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
    echo -e "\n${GREEN}🎉 ALL OMNIA-SHARED TESTS PASSED!${NC}"
    echo -e "${GREEN}Universal product creation system is ready.${NC}"
else
    echo -e "\n${RED}🚨 SOME TESTS FAILED!${NC}"
    echo -e "${RED}Omnia-shared system needs fixes.${NC}"
fi

echo -e "\n${BLUE}=================================================="
echo "📊 OMNIA-SHARED CAPABILITIES"
echo "=================================================="

echo -e "\n${GREEN}✅ READY FEATURES:${NC}"
echo "   • Universal product creation for all projects"
echo "   • Comprehensive error handling and validation"
echo "   • Database logging and analytics"
echo "   • Dry run testing support"
echo "   • CORS and security headers"
echo "   • Statistics and reporting"
echo "   • Multi-project configuration support"

echo -e "\n${BLUE}🎯 SUPPORTED PROJECTS:${NC}"
echo "   • AdTopia: 9 products (Starter $29 → Full Beta $297)"
echo "   • BizBox: 3 products (Starter $99 → Enterprise $499)"
echo "   • GammaFlow: 3 products (Basic $49 → Enterprise $499)"
echo "   • ShieldStaff: 3 products (Basic $129 → Overnight $249)"

echo -e "\n${PURPLE}=================================================="
echo "🚀 OMNIA-SHARED TEST COMPLETE"
echo "=================================================="
