#!/usr/bin/env node

/**
 * App Page Health Check Script
 * Validates frontend stability and component initialization
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  timeout: 10000,
  expectedLogs: [
    'AdCards component initializing...',
    'Loading cards from localStorage...',
    'Demo cards loaded successfully'
  ]
};

async function runHealthCheck() {
  console.log('🚨 Starting App Page Health Check...');
  console.log(`Base URL: ${config.baseUrl}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  const errors = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`[CONSOLE] ${text}`);
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`[ERROR] ${error.message}`);
  });
  
  try {
    console.log('📱 Navigating to /app...');
    await page.goto(`${config.baseUrl}/app`, { 
      waitUntil: 'networkidle',
      timeout: config.timeout 
    });
    
    // Wait for component initialization
    console.log('⏳ Waiting for component initialization...');
    await page.waitForTimeout(2000);
    
    // Check for ErrorBoundary
    const errorBoundary = await page.$('[data-testid="error-boundary"]');
    if (errorBoundary) {
      console.error('❌ ErrorBoundary detected - component failed to render');
      return { success: false, reason: 'ErrorBoundary triggered' };
    }
    
    // Check for blank page
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.trim().length < 100) {
      console.error('❌ Blank page detected');
      return { success: false, reason: 'Blank page' };
    }
    
    // Check for expected console logs
    const foundLogs = config.expectedLogs.filter(expectedLog => 
      logs.some(log => log.includes(expectedLog))
    );
    
    console.log(`📊 Found ${foundLogs.length}/${config.expectedLogs.length} expected logs`);
    
    if (foundLogs.length === config.expectedLogs.length) {
      console.log('✅ All expected logs found');
    } else {
      console.warn('⚠️ Some expected logs missing');
      console.log('Expected:', config.expectedLogs);
      console.log('Found:', foundLogs);
    }
    
    // Check for errors
    if (errors.length > 0) {
      console.error('❌ JavaScript errors detected:', errors);
      return { success: false, reason: 'JavaScript errors', errors };
    }
    
    // Check render timing
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      };
    });
    
    console.log('⏱️ Performance metrics:', performanceMetrics);
    
    if (performanceMetrics.firstPaint > 2000) {
      console.warn('⚠️ Slow first paint detected (>2s)');
    }
    
    console.log('✅ App page health check passed!');
    return { 
      success: true, 
      logs: foundLogs,
      performance: performanceMetrics,
      totalLogs: logs.length
    };
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return { success: false, reason: error.message };
  } finally {
    await browser.close();
  }
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthCheck()
    .then(result => {
      if (result.success) {
        console.log('🎉 Health check completed successfully!');
        process.exit(0);
      } else {
        console.error('💥 Health check failed:', result.reason);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Health check crashed:', error);
      process.exit(1);
    });
}

export { runHealthCheck };
