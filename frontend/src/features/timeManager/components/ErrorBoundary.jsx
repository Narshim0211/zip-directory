import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    
    // Optional: Send to error tracking service
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tm-error-boundary">
          <div className="tm-error-boundary__content">
            <div className="tm-error-boundary__icon">⚠️</div>
            <h3 className="tm-error-boundary__title">
              {this.props.title || "Something went wrong"}
            </h3>
            <p className="tm-error-boundary__message">
              {this.props.message || "This component encountered an error. Other features are still working."}
            </p>
            {this.state.error && (
              <details className="tm-error-boundary__details">
                <summary>Technical Details</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <button 
              className="tm-error-boundary__btn"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
