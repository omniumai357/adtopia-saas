#!/usr/bin/env node

/**
 * Error Analyzer - Advanced Error Detection and Reporting
 * Generates comprehensive error reports for Cursor integration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ErrorAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      component: null,
      errors: [],
      patterns: [],
      solutions: [],
      recommendations: []
    };
  }

  analyzeError(error, component = 'AdCards') {
    this.analysis.component = component;
    
    // Parse error message
    const errorInfo = this.parseError(error);
    this.analysis.errors.push(errorInfo);
    
    // Identify patterns
    const patterns = this.identifyPatterns(errorInfo);
    this.analysis.patterns.push(...patterns);
    
    // Generate solutions
    const solutions = this.generateSolutions(errorInfo, patterns);
    this.analysis.solutions.push(...solutions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(errorInfo, patterns);
    this.analysis.recommendations.push(...recommendations);
    
    return this.analysis;
  }

  parseError(error) {
    const errorInfo = {
      message: error.message || error,
      type: 'unknown',
      severity: 'medium',
      category: 'runtime',
      stack: error.stack || null,
      timestamp: new Date().toISOString()
    };

    // Classify error type
    if (error.message) {
      if (error.message.includes('Cannot read property')) {
        errorInfo.type = 'null_pointer';
        errorInfo.severity = 'high';
        errorInfo.category = 'data_access';
      } else if (error.message.includes('window is not defined')) {
        errorInfo.type = 'ssr_hydration';
        errorInfo.severity = 'high';
        errorInfo.category = 'hydration';
      } else if (error.message.includes('Unexpected token')) {
        errorInfo.type = 'syntax_error';
        errorInfo.severity = 'high';
        errorInfo.category = 'parsing';
      } else if (error.message.includes('Cannot find module')) {
        errorInfo.type = 'module_not_found';
        errorInfo.severity = 'high';
        errorInfo.category = 'import';
      } else if (error.message.includes('map of undefined')) {
        errorInfo.type = 'array_access';
        errorInfo.severity = 'medium';
        errorInfo.category = 'data_processing';
      } else if (error.message.includes('localStorage')) {
        errorInfo.type = 'storage_error';
        errorInfo.severity = 'medium';
        errorInfo.category = 'storage';
      }
    }

    return errorInfo;
  }

  identifyPatterns(errorInfo) {
    const patterns = [];

    // Common React patterns
    if (errorInfo.type === 'null_pointer' && errorInfo.message.includes('map')) {
      patterns.push({
        name: 'array_map_null',
        description: 'Attempting to map over undefined/null array',
        frequency: 'common',
        impact: 'component_crash'
      });
    }

    if (errorInfo.type === 'ssr_hydration') {
      patterns.push({
        name: 'ssr_client_mismatch',
        description: 'Server-side rendering and client-side hydration mismatch',
        frequency: 'common',
        impact: 'hydration_failure'
      });
    }

    if (errorInfo.type === 'storage_error') {
      patterns.push({
        name: 'localStorage_access',
        description: 'localStorage access in SSR environment',
        frequency: 'common',
        impact: 'initialization_failure'
      });
    }

    return patterns;
  }

  generateSolutions(errorInfo, patterns) {
    const solutions = [];

    // Array map null solutions
    if (patterns.some(p => p.name === 'array_map_null')) {
      solutions.push({
        id: 'array_map_null_fix',
        title: 'Fix Array Map Null Error',
        description: 'Add null checks before mapping over arrays',
        code: `
// Before
{items.map(item => <div key={item.id}>{item.name}</div>)}

// After
{items?.map(item => <div key={item.id}>{item.name}</div>) || []}
        `,
        priority: 'high',
        category: 'data_handling'
      });
    }

    // SSR hydration solutions
    if (patterns.some(p => p.name === 'ssr_client_mismatch')) {
      solutions.push({
        id: 'ssr_hydration_fix',
        title: 'Fix SSR Hydration Mismatch',
        description: 'Use useEffect for client-side only operations',
        code: `
// Before
const data = localStorage.getItem('key');

// After
const [data, setData] = useState(null);
useEffect(() => {
  setData(localStorage.getItem('key'));
}, []);
        `,
        priority: 'high',
        category: 'hydration'
      });
    }

    // localStorage access solutions
    if (patterns.some(p => p.name === 'localStorage_access')) {
      solutions.push({
        id: 'localStorage_ssr_fix',
        title: 'Fix localStorage SSR Access',
        description: 'Check for window object before accessing localStorage',
        code: `
// Before
const data = localStorage.getItem('key');

// After
const data = typeof window !== 'undefined' ? localStorage.getItem('key') : null;
        `,
        priority: 'medium',
        category: 'storage'
      });
    }

    return solutions;
  }

  generateRecommendations(errorInfo, patterns) {
    const recommendations = [];

    // General recommendations
    recommendations.push({
      priority: 'high',
      category: 'error_handling',
      title: 'Implement Error Boundaries',
      description: 'Add React Error Boundaries to catch and handle component errors gracefully',
      action: 'Wrap components in ErrorBoundary components'
    });

    recommendations.push({
      priority: 'medium',
      category: 'testing',
      title: 'Add Error Scenario Tests',
      description: 'Create tests that simulate error conditions',
      action: 'Write unit tests for error handling paths'
    });

    recommendations.push({
      priority: 'low',
      category: 'monitoring',
      title: 'Implement Error Tracking',
      description: 'Add error tracking service for production monitoring',
      action: 'Integrate Sentry or similar error tracking service'
    });

    return recommendations;
  }

  generateReport(outputPath = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = outputPath || join(__dirname, '..', 'qa', 'reports', `error-analysis-${timestamp}.md`);

    // Ensure output directory exists
    const outputDir = dirname(reportPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const report = this.generateMarkdownReport();
    writeFileSync(reportPath, report);

    console.log(`📊 Error analysis report generated: ${reportPath}`);
    return reportPath;
  }

  generateMarkdownReport() {
    const { analysis } = this;
    
    return `# Error Analysis Report

**Generated:** ${analysis.timestamp}  
**Component:** ${analysis.component}  
**Total Errors:** ${analysis.errors.length}

## Error Summary

${analysis.errors.map((error, index) => `
### Error ${index + 1}
- **Type:** ${error.type}
- **Severity:** ${error.severity}
- **Category:** ${error.category}
- **Message:** ${error.message}
- **Timestamp:** ${error.timestamp}
`).join('\n')}

## Identified Patterns

${analysis.patterns.map((pattern, index) => `
### Pattern ${index + 1}: ${pattern.name}
- **Description:** ${pattern.description}
- **Frequency:** ${pattern.frequency}
- **Impact:** ${pattern.impact}
`).join('\n')}

## Recommended Solutions

${analysis.solutions.map((solution, index) => `
### Solution ${index + 1}: ${solution.title}
- **Priority:** ${solution.priority}
- **Category:** ${solution.category}
- **Description:** ${solution.description}

\`\`\`typescript
${solution.code}
\`\`\`
`).join('\n')}

## Recommendations

${analysis.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title}
- **Priority:** ${rec.priority}
- **Category:** ${rec.category}
- **Description:** ${rec.description}
- **Action:** ${rec.action}
`).join('\n')}

## Next Steps

1. **Immediate Actions:**
   - Fix high-priority errors
   - Implement error boundaries
   - Add null checks for data access

2. **Short-term Improvements:**
   - Add comprehensive error handling
   - Implement error tracking
   - Create error scenario tests

3. **Long-term Enhancements:**
   - Establish error monitoring
   - Create error recovery mechanisms
   - Implement automated error reporting

---
*Report generated by AdTopia Error Analyzer v1.0*
`;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    component: 'AdCards',
    output: null
  };

  args.forEach(arg => {
    if (arg.startsWith('--component=')) {
      options.component = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  });

  // Example error for demonstration
  const exampleError = new Error('Cannot read property "map" of undefined');
  exampleError.stack = `
    at AdCards.render (AdCards.tsx:45:12)
    at ReactDOM.render (react-dom.js:1234:56)
    at Object.render (index.js:78:90)
  `;

  const analyzer = new ErrorAnalyzer();
  analyzer.analyzeError(exampleError, options.component);
  analyzer.generateReport(options.output);
}

export { ErrorAnalyzer };
