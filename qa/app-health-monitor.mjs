#!/usr/bin/env node

/**
 * Enterprise-Grade App Health Monitor
 * Comprehensive diagnostic system for /app page stability
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  timeout: 10000,
  verbose: false,
  outputDir: join(__dirname, '..', 'qa', 'reports'),
  expectedLogs: [
    'AdCards component initializing...',
    'Loading cards from localStorage...',
    'Demo cards loaded successfully'
  ],
  healthThresholds: {
    firstPaint: 2000, // 2 seconds
    domContentLoaded: 1000, // 1 second
    loadComplete: 3000, // 3 seconds
    errorCount: 0,
    logCount: 3
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  route: '/app',
  timeout: 5000,
  verbose: false,
  output: null
};

args.forEach(arg => {
  if (arg.startsWith('--route=')) {
    options.route = arg.split('=')[1];
  } else if (arg.startsWith('--timeout=')) {
    options.timeout = parseInt(arg.split('=')[1]);
  } else if (arg === '--verbose') {
    options.verbose = true;
    config.verbose = true;
  } else if (arg.startsWith('--output=')) {
    options.output = arg.split('=')[1];
  }
});

class AppHealthMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      route: options.route,
      status: 'unknown',
      metrics: {},
      logs: [],
      errors: [],
      recommendations: []
    };
  }

  async runDiagnostics() {
    console.log('🚨 Starting Enterprise-Grade App Health Monitor...');
    console.log(`Route: ${options.route}`);
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Timeout: ${options.timeout}ms`);
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (compatible; AppHealthMonitor/1.0)'
    });
    
    const page = await context.newPage();
    
    // Set up monitoring
    this.setupMonitoring(page);
    
    try {
      // Navigate to the route
      console.log(`📱 Navigating to ${options.route}...`);
      await page.goto(`${config.baseUrl}${options.route}`, { 
        waitUntil: 'networkidle',
        timeout: options.timeout 
      });
      
      // Wait for component initialization
      console.log('⏳ Waiting for component initialization...');
      await page.waitForTimeout(2000);
      
      // Run comprehensive diagnostics
      await this.runComprehensiveDiagnostics(page);
      
      // Generate health score
      this.calculateHealthScore();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Output results
      this.outputResults();
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.status = 'failed';
      this.results.errors.push({
        type: 'navigation_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await browser.close();
    }
    
    return this.results;
  }

  setupMonitoring(page) {
    // Capture console logs
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      this.results.logs.push(logEntry);
      
      if (config.verbose) {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      const errorEntry = {
        type: 'javascript_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      this.results.errors.push(errorEntry);
      console.error(`[ERROR] ${error.message}`);
    });
    
    // Capture network errors
    page.on('response', response => {
      if (!response.ok()) {
        const errorEntry = {
          type: 'network_error',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        };
        this.results.errors.push(errorEntry);
        console.error(`[NETWORK] ${response.status()} ${response.url()}`);
      }
    });
  }

  async runComprehensiveDiagnostics(page) {
    console.log('🔍 Running comprehensive diagnostics...');
    
    // Check for ErrorBoundary
    const errorBoundary = await page.$('[data-testid="error-boundary"]');
    if (errorBoundary) {
      this.results.errors.push({
        type: 'error_boundary',
        message: 'ErrorBoundary component detected',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for blank page
    const bodyText = await page.textContent('body');
    if (!bodyText || bodyText.trim().length < 100) {
      this.results.errors.push({
        type: 'blank_page',
        message: 'Page appears to be blank or has minimal content',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for AdCards component
    const adCardsComponent = await page.$('[data-testid="ad-cards"]');
    if (!adCardsComponent) {
      this.results.errors.push({
        type: 'missing_component',
        message: 'AdCards component not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for expected console logs
    const foundLogs = config.expectedLogs.filter(expectedLog => 
      this.results.logs.some(log => log.text.includes(expectedLog))
    );
    
    this.results.metrics.expectedLogsFound = foundLogs.length;
    this.results.metrics.expectedLogsTotal = config.expectedLogs.length;
    this.results.metrics.logsFound = foundLogs;
    
    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    this.results.metrics.performance = performanceMetrics;
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      try {
        return {
          adCards: localStorage.getItem('ad_mvp.cards.v1'),
          hasData: localStorage.getItem('ad_mvp.cards.v1') !== null
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    this.results.metrics.localStorage = localStorageData;
    
    // Check component state
    const componentState = await page.evaluate(() => {
      try {
        return {
          windowAdCards: typeof window.AdCards !== 'undefined',
          documentReady: document.readyState,
          hasReactRoot: document.querySelector('#__next') !== null
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    this.results.metrics.componentState = componentState;
  }

  calculateHealthScore() {
    let score = 100;
    const issues = [];
    
    // Check for errors
    if (this.results.errors.length > 0) {
      score -= this.results.errors.length * 20;
      issues.push(`${this.results.errors.length} errors detected`);
    }
    
    // Check expected logs
    const logRatio = this.results.metrics.expectedLogsFound / this.results.metrics.expectedLogsTotal;
    if (logRatio < 1) {
      score -= (1 - logRatio) * 30;
      issues.push(`Missing ${this.results.metrics.expectedLogsTotal - this.results.metrics.expectedLogsFound} expected logs`);
    }
    
    // Check performance
    if (this.results.metrics.performance) {
      const perf = this.results.metrics.performance;
      if (perf.firstPaint > config.healthThresholds.firstPaint) {
        score -= 15;
        issues.push(`Slow first paint: ${perf.firstPaint}ms`);
      }
      if (perf.domContentLoaded > config.healthThresholds.domContentLoaded) {
        score -= 10;
        issues.push(`Slow DOM content loaded: ${perf.domContentLoaded}ms`);
      }
    }
    
    // Check localStorage
    if (!this.results.metrics.localStorage?.hasData) {
      score -= 10;
      issues.push('localStorage data not found');
    }
    
    this.results.metrics.healthScore = Math.max(0, score);
    this.results.metrics.issues = issues;
    
    // Determine status
    if (score >= 90) {
      this.results.status = 'excellent';
    } else if (score >= 70) {
      this.results.status = 'good';
    } else if (score >= 50) {
      this.results.status = 'fair';
    } else {
      this.results.status = 'poor';
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.errors.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'errors',
        message: 'Fix JavaScript errors and component failures',
        action: 'Review error logs and fix underlying issues'
      });
    }
    
    if (this.results.metrics.expectedLogsFound < this.results.metrics.expectedLogsTotal) {
      recommendations.push({
        priority: 'medium',
        category: 'initialization',
        message: 'Ensure all expected initialization logs are present',
        action: 'Check AdCards component initialization logic'
      });
    }
    
    if (this.results.metrics.performance?.firstPaint > config.healthThresholds.firstPaint) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        message: 'Optimize first paint performance',
        action: 'Consider code splitting and lazy loading'
      });
    }
    
    if (!this.results.metrics.localStorage?.hasData) {
      recommendations.push({
        priority: 'low',
        category: 'data',
        message: 'Ensure localStorage data is properly seeded',
        action: 'Check demo data initialization'
      });
    }
    
    this.results.recommendations = recommendations;
  }

  outputResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = options.output || join(config.outputDir, `health-check-${timestamp}.json`);
    
    // Ensure output directory exists
    if (!existsSync(config.outputDir)) {
      mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Write detailed report
    writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    // Console output
    console.log('\n🎯 HEALTH CHECK RESULTS:');
    console.log(`Status: ${this.results.status.toUpperCase()}`);
    console.log(`Health Score: ${this.results.metrics.healthScore}/100`);
    console.log(`Errors: ${this.results.errors.length}`);
    console.log(`Expected Logs: ${this.results.metrics.expectedLogsFound}/${this.results.metrics.expectedLogsTotal}`);
    
    if (this.results.metrics.performance) {
      console.log(`First Paint: ${this.results.metrics.performance.firstPaint}ms`);
      console.log(`Load Time: ${this.results.metrics.performance.totalLoadTime}ms`);
    }
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    console.log(`\n📊 Detailed report saved to: ${reportFile}`);
    
    // Exit with appropriate code
    if (this.results.status === 'excellent' || this.results.status === 'good') {
      console.log('✅ Health check passed!');
      process.exit(0);
    } else {
      console.log('❌ Health check failed!');
      process.exit(1);
    }
  }
}

// Run health monitor if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new AppHealthMonitor();
  monitor.runDiagnostics()
    .catch(error => {
      console.error('💥 Health monitor crashed:', error);
      process.exit(1);
    });
}

export { AppHealthMonitor };
