"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // This catches ANY React render error in child components
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // Error logged or handled if monitoring is active
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-grade-fail">Something went wrong</h2>
            <p className="text-sm text-foreground-secondary">
              The UI crashed unexpectedly.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-surface border border-border-strong rounded-lg text-sm hover:bg-surface-elevated"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}