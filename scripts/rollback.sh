#!/bin/bash

# 🚀 DEPLOYMENT ROLLBACK AUTOMATION SCRIPT
# AdTopia / BizBox / Omnia Production Rollback Guide
# Version: 1.0 — Generated 2025-10-08
# Maintainer: omniumai357

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
PROJECT_NAME="adtopia-saas"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
VERCEL_PROJECT="adtopia-saas"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "🚀 Starting AdTopia Production Rollback Process"
log "Backup directory: $BACKUP_DIR"

# Step 1: Vercel Rollback
log "Step 1: Reverting Vercel deployment..."
if vercel rollback --project "$VERCEL_PROJECT" --yes; then
    success "✅ Vercel deployment rolled back successfully"
else
    error "❌ Vercel rollback failed"
    exit 1
fi

# Step 2: Database Schema Rollback
log "Step 2: Checking database schema rollback..."
warning "⚠️  Database rollback requires manual verification"
log "Run the following command to check migration status:"
echo "supabase db reset --seed"
log "Or check migration status with:"
echo "SELECT count(*) FROM supabase_migrations.schema_migrations;"

# Step 3: Code Rollback
log "Step 3: Rolling back code to previous commit..."
if git log --oneline -5; then
    log "Recent commits:"
    read -p "Enter the commit hash to rollback to (or press Enter for HEAD~1): " ROLLBACK_COMMIT
    
    if [ -z "$ROLLBACK_COMMIT" ]; then
        ROLLBACK_COMMIT="HEAD~1"
    fi
    
    log "Rolling back to commit: $ROLLBACK_COMMIT"
    
    # Create backup of current state
    git stash push -m "Pre-rollback backup $(date)"
    git stash show -p > "$BACKUP_DIR/pre_rollback.patch"
    
    # Perform rollback
    if git reset --hard "$ROLLBACK_COMMIT"; then
        success "✅ Code rolled back to $ROLLBACK_COMMIT"
        
        # Force push (use with caution)
        read -p "Force push to remote? (y/N): " FORCE_PUSH
        if [[ $FORCE_PUSH =~ ^[Yy]$ ]]; then
            if git push -f origin main; then
                success "✅ Code rollback pushed to remote"
            else
                error "❌ Failed to push rollback to remote"
                exit 1
            fi
        else
            warning "⚠️  Rollback not pushed to remote. Manual push required."
        fi
    else
        error "❌ Code rollback failed"
        exit 1
    fi
else
    error "❌ Failed to get git log"
    exit 1
fi

# Step 4: Environment Rollback
log "Step 4: Checking environment rollback..."
if [ -f ".env.previous" ]; then
    log "Previous environment file found"
    read -p "Restore previous environment? (y/N): " RESTORE_ENV
    if [[ $RESTORE_ENV =~ ^[Yy]$ ]]; then
        cp .env.production "$BACKUP_DIR/env.production.backup"
        cp .env.previous .env.production
        success "✅ Environment restored from .env.previous"
        
        # Redeploy with previous environment
        if vercel redeploy --env .env.production; then
            success "✅ Redeployed with previous environment"
        else
            error "❌ Failed to redeploy with previous environment"
        fi
    fi
else
    warning "⚠️  No .env.previous file found. Manual environment restoration required."
fi

# Post-rollback verification
log "🔍 Post-rollback verification..."

# Check Vercel deployment status
log "Checking Vercel deployment status..."
if vercel ls --project "$VERCEL_PROJECT" | head -5; then
    success "✅ Vercel deployment status checked"
fi

# Check git status
log "Checking git status..."
if git status --porcelain; then
    log "Git status:"
    git status
else
    success "✅ Git working directory is clean"
fi

# Generate rollback report
log "📋 Generating rollback report..."
cat > "$BACKUP_DIR/rollback_report.md" << EOF
# Rollback Report
**Date:** $(date)
**Project:** $PROJECT_NAME
**Rollback Commit:** $ROLLBACK_COMMIT
**Backup Directory:** $BACKUP_DIR

## Actions Performed:
1. ✅ Vercel deployment rolled back
2. ⚠️  Database rollback requires manual verification
3. ✅ Code rolled back to $ROLLBACK_COMMIT
4. ⚠️  Environment rollback requires manual verification

## Next Steps:
1. Verify application functionality
2. Check database schema consistency
3. Monitor system performance
4. Update team on rollback status

## Recovery Commands:
\`\`\`bash
# Restore from backup if needed
git stash pop
git apply $BACKUP_DIR/pre_rollback.patch

# Check deployment status
vercel ls --project $VERCEL_PROJECT

# Check database status
supabase status
\`\`\`
EOF

success "✅ Rollback report generated: $BACKUP_DIR/rollback_report.md"

# Final status
log "🎯 Rollback Process Complete!"
log "Backup location: $BACKUP_DIR"
log "Rollback report: $BACKUP_DIR/rollback_report.md"

warning "⚠️  IMPORTANT: Manual verification required for:"
echo "  - Database schema consistency"
echo "  - Environment variable validation"
echo "  - Application functionality testing"

success "🚀 AdTopia rollback process completed successfully!"

# Optional: Open rollback report
read -p "Open rollback report? (y/N): " OPEN_REPORT
if [[ $OPEN_REPORT =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code "$BACKUP_DIR/rollback_report.md"
    elif command -v open &> /dev/null; then
        open "$BACKUP_DIR/rollback_report.md"
    else
        log "Rollback report: $BACKUP_DIR/rollback_report.md"
    fi
fi
