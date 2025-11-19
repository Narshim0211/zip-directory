import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error('Production Error:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          backgroundColor: '#FEF2F2',
          borderRadius: '12px',
          margin: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#DC2626',
            marginBottom: '0.5rem' 
          }}>
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p style={{ 
            color: '#991B1B', 
            marginBottom: '1.5rem',
            maxWidth: '500px' 
          }}>
            {this.props.fallbackMessage || 
              'This section encountered an error. Other parts of the app should still work.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#DC2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'white',
                color: '#DC2626',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #DC2626',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left',
              width: '100%',
              maxWidth: '800px',
              backgroundColor: '#FEE2E2',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 600,
                color: '#991B1B',
                marginBottom: '0.5rem'
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                fontSize: '0.875rem',
                color: '#7F1D1D',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
