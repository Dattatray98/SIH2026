import { Component, ErrorInfo, ReactNode } from "react";

// Defines the content guarded by the boundary and the error it may capture.
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Prevents a rendering exception from leaving the user with a blank page.
export default class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    error: null,
  };

  // Convert a descendant render failure into state for the fallback interface.
  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  // Keep diagnostic details available to developers without exposing them in normal UI.
  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("SatQuery AI crashed:", error, info?.componentStack);
  }

  // Render either the protected app tree or the recoverable error screen.
  public override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="w-full min-h-screen p-10 bg-sat-bg text-sat-text font-mono">
          <div className="text-sat-danger text-[16px] font-semibold mb-3">
            SatQuery AI failed to render
          </div>
          <div className="text-[13.5px] mb-4 max-w-[640px] text-sat-text">
            {String(this.state.error?.message || this.state.error)}
          </div>
          {this.state.error?.stack && (
            <pre className="bg-sat-panel border border-sat-border p-3 text-[11.5px] whitespace-pre-wrap max-w-[720px] overflow-x-auto mb-4 text-sat-muted">
              {this.state.error.stack}
            </pre>
          )}
          <div className="text-sat-faint text-xs max-w-[640px]">
            Open the browser console (F12) for the full trace. This panel
            exists so a render error shows up here instead of a blank page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
