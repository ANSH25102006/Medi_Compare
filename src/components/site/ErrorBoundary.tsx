import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elevated md:p-10">
            {/* Visual background accents */}
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-destructive/10 blur-xl" />
            <div className="absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-primary/5 blur-2xl" />

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-soft animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-card-foreground md:text-3xl">
                Something went wrong
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                We encountered an unexpected rendering error. To ensure stability, we've halted execution and loaded this recovery screen.
              </p>

              {/* Diagnostic Log Panel */}
              <div className="mt-6 w-full overflow-hidden rounded-2xl border border-border bg-muted/50 p-4 text-left shadow-inner">
                <p className="font-mono text-xs font-semibold text-destructive uppercase tracking-wider">
                  Diagnostic Log
                </p>
                <div className="mt-2 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <p className="font-bold text-foreground">
                    Error: {this.state.error?.message || "Unknown rendering exception"}
                  </p>
                  {this.state.error?.stack && (
                    <pre className="mt-2 whitespace-pre-wrap opacity-80">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 whitespace-pre-wrap opacity-60">
                      Component Stack: {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={this.handleReset}
                  className="w-full sm:w-auto rounded-full bg-primary font-semibold text-primary-foreground transition-all hover:shadow-soft"
                >
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" /> Reset & Clear Cache
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full sm:w-auto rounded-full font-semibold border-border transition-all hover:bg-muted"
                >
                  <Home className="mr-2 h-4 w-4" /> Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
