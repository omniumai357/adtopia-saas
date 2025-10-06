#!/bin/bash
# Comprehensive System-Wide Audit Script
# AdTopia SaaS - Production Readiness Check

echo "🔍 ADTOPIA SAAS - COMPREHENSIVE SYSTEM AUDIT"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Audit counters
ISSUES_FOUND=0
WARNINGS_FOUND=0
CRITICAL_ISSUES=0

# Function to log issues
log_issue() {
    local severity=$1
    local message=$2
    case $severity in
        "CRITICAL")
            echo -e "${RED}🚨 CRITICAL: $message${NC}"
            ((CRITICAL_ISSUES++))
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
            ((WARNINGS_FOUND++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO: $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ SUCCESS: $message${NC}"
            ;;
    esac
    ((ISSUES_FOUND++))
}

echo -e "\n${PURPLE}1. MOCK DATA & PLACEHOLDER AUDIT${NC}"
echo "=================================="

# Check for mock data in configuration files
echo -e "\n${BLUE}Checking for mock/placeholder data...${NC}"

# Check Stripe configuration
if grep -r "test_" src/config/ 2>/dev/null | grep -v "test_" > /dev/null; then
    log_issue "WARNING" "Potential test data found in Stripe config"
fi

if grep -r "your_" src/config/ 2>/dev/null; then
    log_issue "CRITICAL" "Placeholder data found in configuration files"
fi

if grep -r "placeholder" src/ 2>/dev/null; then
    log_issue "WARNING" "Placeholder text found in source code"
fi

if grep -r "TODO\|FIXME\|XXX" src/ 2>/dev/null; then
    log_issue "WARNING" "TODO/FIXME comments found in source code"
fi

# Check for hardcoded URLs
if grep -r "localhost\|127.0.0.1" src/ 2>/dev/null; then
    log_issue "WARNING" "Localhost URLs found in source code"
fi

# Check for mock API keys
if grep -r "sk_test_\|pk_test_" src/ 2>/dev/null; then
    log_issue "CRITICAL" "Test API keys found in source code"
fi

echo -e "\n${PURPLE}2. ENVIRONMENT & CONFIGURATION AUDIT${NC}"
echo "=========================================="

# Check environment files
echo -e "\n${BLUE}Checking environment configuration...${NC}"

if [ ! -f ".env.example" ]; then
    log_issue "WARNING" "Environment example file missing"
else
    log_issue "SUCCESS" "Environment example file exists"
fi

if [ -f ".env.local" ]; then
    log_issue "INFO" "Local environment file exists (should be in .gitignore)"
fi

# Check package.json for issues
if [ -f "package.json" ]; then
    if grep -q "mock\|test\|placeholder" package.json; then
        log_issue "WARNING" "Mock/test references in package.json"
    fi
    
    # Check for outdated dependencies
    if command -v npm &> /dev/null; then
        echo "Checking for outdated dependencies..."
        npm outdated 2>/dev/null | head -5
    fi
fi

echo -e "\n${PURPLE}3. SECURITY AUDIT${NC}"
echo "=================="

echo -e "\n${BLUE}Checking security configuration...${NC}"

# Check for exposed secrets
if grep -r "sk_live_\|pk_live_" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    log_issue "CRITICAL" "Live API keys found in codebase"
fi

# Check for weak passwords or default values
if grep -r "password.*123\|admin.*admin\|test.*test" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    log_issue "WARNING" "Weak passwords or default values found"
fi

# Check CORS configuration
if grep -r "Access-Control-Allow-Origin.*\*" . 2>/dev/null; then
    log_issue "WARNING" "Wildcard CORS policy found (may be intentional for development)"
fi

# Check for SQL injection vulnerabilities
if grep -r "SELECT.*\$" . 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
    log_issue "WARNING" "Potential SQL injection vulnerability"
fi

echo -e "\n${PURPLE}4. DEPLOYMENT & INFRASTRUCTURE AUDIT${NC}"
echo "=========================================="

echo -e "\n${BLUE}Checking deployment configuration...${NC}"

# Check Vercel configuration
if [ -f "vercel.json" ]; then
    if grep -q "placeholder\|test\|mock" vercel.json; then
        log_issue "WARNING" "Mock data in Vercel configuration"
    fi
    log_issue "SUCCESS" "Vercel configuration exists"
else
    log_issue "WARNING" "Vercel configuration missing"
fi

# Check Next.js configuration
if [ -f "next.config.js" ]; then
    if grep -q "localhost\|127.0.0.1" next.config.js; then
        log_issue "WARNING" "Localhost references in Next.js config"
    fi
    log_issue "SUCCESS" "Next.js configuration exists"
fi

# Check Supabase configuration
if [ -d "supabase" ]; then
    if [ -f "supabase/config.toml" ]; then
        log_issue "SUCCESS" "Supabase configuration exists"
    else
        log_issue "WARNING" "Supabase config.toml missing"
    fi
else
    log_issue "WARNING" "Supabase directory missing"
fi

echo -e "\n${PURPLE}5. CODE QUALITY & STRUCTURE AUDIT${NC}"
echo "====================================="

echo -e "\n${BLUE}Checking code structure and quality...${NC}"

# Check for proper directory structure
required_dirs=("src" "app" "public" "supabase")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        log_issue "SUCCESS" "Required directory '$dir' exists"
    else
        log_issue "WARNING" "Required directory '$dir' missing"
    fi
done

# Check for TypeScript configuration
if [ -f "tsconfig.json" ]; then
    log_issue "SUCCESS" "TypeScript configuration exists"
else
    log_issue "WARNING" "TypeScript configuration missing"
fi

# Check for linting configuration
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || grep -q "eslint" package.json; then
    log_issue "SUCCESS" "ESLint configuration exists"
else
    log_issue "WARNING" "ESLint configuration missing"
fi

# Check for unused files
if [ -f "src/App.css" ]; then
    log_issue "WARNING" "Unused App.css file found (Vite template remnant)"
fi

echo -e "\n${PURPLE}6. API & INTEGRATION AUDIT${NC}"
echo "============================="

echo -e "\n${BLUE}Checking API integrations...${NC}"

# Check Stripe integration
if grep -r "stripe" src/ 2>/dev/null; then
    log_issue "SUCCESS" "Stripe integration found in source"
else
    log_issue "WARNING" "No Stripe integration found in source"
fi

# Check Supabase integration
if grep -r "supabase" src/ 2>/dev/null; then
    log_issue "SUCCESS" "Supabase integration found in source"
else
    log_issue "WARNING" "No Supabase integration found in source"
fi

# Check for API endpoints
if [ -d "app/api" ] || [ -d "pages/api" ]; then
    log_issue "SUCCESS" "API routes directory exists"
else
    log_issue "WARNING" "No API routes directory found"
fi

echo -e "\n${PURPLE}7. PERFORMANCE & OPTIMIZATION AUDIT${NC}"
echo "======================================"

echo -e "\n${BLUE}Checking performance optimizations...${NC}"

# Check for image optimization
if grep -r "next/image" src/ 2>/dev/null; then
    log_issue "SUCCESS" "Next.js Image component usage found"
else
    log_issue "WARNING" "No Next.js Image optimization found"
fi

# Check for lazy loading
if grep -r "lazy\|dynamic" src/ 2>/dev/null; then
    log_issue "SUCCESS" "Lazy loading implementation found"
else
    log_issue "WARNING" "No lazy loading implementation found"
fi

# Check bundle size
if [ -f "package.json" ]; then
    bundle_size=$(du -sh node_modules 2>/dev/null | cut -f1)
    if [ ! -z "$bundle_size" ]; then
        log_issue "INFO" "Node modules size: $bundle_size"
    fi
fi

echo -e "\n${PURPLE}8. TESTING & VALIDATION AUDIT${NC}"
echo "================================="

echo -e "\n${BLUE}Checking testing setup...${NC}"

# Check for test files
if find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | head -1 > /dev/null; then
    log_issue "SUCCESS" "Test files found"
else
    log_issue "WARNING" "No test files found"
fi

# Check for testing dependencies
if grep -q "jest\|vitest\|cypress\|playwright" package.json 2>/dev/null; then
    log_issue "SUCCESS" "Testing dependencies found"
else
    log_issue "WARNING" "No testing dependencies found"
fi

echo -e "\n${PURPLE}9. DOCUMENTATION AUDIT${NC}"
echo "======================="

echo -e "\n${BLUE}Checking documentation...${NC}"

required_docs=("README.md" "ARCHITECTURE.md" "RELEASE_PLAN.md")
for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        log_issue "SUCCESS" "Documentation file '$doc' exists"
    else
        log_issue "WARNING" "Documentation file '$doc' missing"
    fi
done

# Check for inline documentation
if find src/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "TODO\|FIXME" 2>/dev/null; then
    log_issue "WARNING" "TODO/FIXME comments found in source files"
fi

echo -e "\n${PURPLE}10. FRICTION POINTS & BOTTLENECKS AUDIT${NC}"
echo "============================================="

echo -e "\n${BLUE}Checking for friction points and bottlenecks...${NC}"

# Check for hardcoded delays
if grep -r "setTimeout\|setInterval" src/ 2>/dev/null; then
    log_issue "WARNING" "Hardcoded delays found (potential bottleneck)"
fi

# Check for synchronous operations
if grep -r "\.sync\|fs\.readFileSync" src/ 2>/dev/null; then
    log_issue "WARNING" "Synchronous file operations found (potential bottleneck)"
fi

# Check for large imports
if find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -5; then
    log_issue "INFO" "Largest files identified (check for potential bottlenecks)"
fi

# Check for circular dependencies
if command -v madge &> /dev/null; then
    echo "Checking for circular dependencies..."
    madge --circular src/ 2>/dev/null || log_issue "WARNING" "Circular dependency check failed (madge not available)"
fi

echo -e "\n${PURPLE}=============================================="
echo "🔍 AUDIT SUMMARY"
echo "=============================================="

echo -e "\n${BLUE}Total Issues Found: $ISSUES_FOUND${NC}"
echo -e "${RED}Critical Issues: $CRITICAL_ISSUES${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS_FOUND${NC}"

if [ $CRITICAL_ISSUES -eq 0 ]; then
    echo -e "\n${GREEN}🎉 NO CRITICAL ISSUES FOUND!${NC}"
    echo -e "${GREEN}System is ready for production deployment.${NC}"
else
    echo -e "\n${RED}🚨 CRITICAL ISSUES MUST BE RESOLVED BEFORE PRODUCTION!${NC}"
fi

if [ $WARNINGS_FOUND -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  $WARNINGS_FOUND warnings should be reviewed and addressed.${NC}"
fi

echo -e "\n${BLUE}=============================================="
echo "📋 RECOMMENDATIONS"
echo "=============================================="

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "\n${RED}1. IMMEDIATE ACTIONS REQUIRED:${NC}"
    echo "   • Remove all placeholder/mock data"
    echo "   • Secure all API keys and secrets"
    echo "   • Fix security vulnerabilities"
fi

if [ $WARNINGS_FOUND -gt 0 ]; then
    echo -e "\n${YELLOW}2. RECOMMENDED IMPROVEMENTS:${NC}"
    echo "   • Add comprehensive testing suite"
    echo "   • Implement performance optimizations"
    echo "   • Complete documentation"
    echo "   • Remove development-only configurations"
fi

echo -e "\n${GREEN}3. PRODUCTION READINESS:${NC}"
echo "   • All critical issues resolved: $([ $CRITICAL_ISSUES -eq 0 ] && echo "✅ YES" || echo "❌ NO")"
echo "   • Security audit passed: $([ $CRITICAL_ISSUES -eq 0 ] && echo "✅ YES" || echo "❌ NO")"
echo "   • Documentation complete: $([ -f "README.md" ] && echo "✅ YES" || echo "❌ NO")"
echo "   • Deployment ready: $([ -f "vercel.json" ] && echo "✅ YES" || echo "❌ NO")"

echo -e "\n${PURPLE}=============================================="
echo "🚀 AUDIT COMPLETE"
echo "=============================================="
