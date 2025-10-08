// Create: src/components/ErrorBoundary.tsx
// React error boundary for frontend error handling

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AdTopiaErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdTopia Error Boundary caught an error:', error, errorInfo);
    
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send error to your monitoring service
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo,
        timestamp: new Date().toISOString(),
        user: 'omniumai357',
        url: window.location.href
      })
    }).catch(logError => {
      console.error('Failed to log error to service:', logError);
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            🚨 AdTopia System Error
          </h2>
          <p className="text-gray-700 mb-4">
            Something went wrong in the revenue system. Our team has been notified.
          </p>
          <details className="text-left bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer font-semibold">
              Technical Details (Click to expand)
            </summary>
            <pre className="mt-2 text-sm overflow-auto">
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
