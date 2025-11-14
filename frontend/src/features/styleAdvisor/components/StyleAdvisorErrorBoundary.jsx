import React from "react";

export default class StyleAdvisorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("StyleAdvisorErrorBoundary", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">AI Style Advisor</div>
              <div className="panel-sub">This module is temporarily unavailable.</div>
            </div>
          </div>
          <p style={{ marginTop: 12 }}>Please refresh the page or come back later.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
