import React from 'react';

/**
 * EngagementErrorBoundary
 * Catches errors in engagement components
 * Prevents entire page crash if analytics fail
 */
class EngagementErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Engagement component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '8px 12px',
          background: '#fff3cd',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#856404',
          marginTop: '12px'
        }}>
          ⚠️ Analytics temporarily unavailable
        </div>
      );
    }

    return this.props.children;
  }
}

export default EngagementErrorBoundary;
