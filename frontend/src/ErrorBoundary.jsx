import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Still logs to the real console too, in addition to the on-page panel.
    console.error("SatQuery AI crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-panel">
          <div className="crash-title">SatQuery AI failed to render</div>
          <div className="crash-message">{String(this.state.error?.message || this.state.error)}</div>
          {this.state.error?.stack && <pre className="crash-stack">{this.state.error.stack}</pre>}
          <div className="crash-hint">
            Open the browser console (F12) for the full trace. This panel exists so a render error
            shows up here instead of a blank page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
