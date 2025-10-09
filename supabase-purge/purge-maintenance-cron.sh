#!/bin/bash
# 🤖 SUPABASE PURGE MAINTENANCE CRON
# Run daily at 2 AM

cd /Users/The10Komancheria/adtopia-saas/supabase-purge
source ../.env.local
python3 purge-automation.py >> purge-maintenance.log 2>&1
