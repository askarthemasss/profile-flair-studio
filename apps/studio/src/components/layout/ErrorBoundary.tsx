import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <div className="notebook-card max-w-md p-8 text-center">
            <div className="notebook-icon mx-auto mb-4 text-crimson">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-light tracking-[0.04em] text-charcoal">
              Something went wrong
            </h2>
            <div className="notebook-rule mx-auto my-4" />
            <p className="break-words font-mono text-[11px] leading-relaxed text-warm-grey">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="notebook-btn notebook-btn--primary notebook-btn--sm mt-6"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
