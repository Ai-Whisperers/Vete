import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showHomeLink?: boolean;
  showRefreshButton?: boolean;
  /** Context identifier for logging (e.g., "CartProvider", "BookingWizard") */
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log with structured logger
    logger.error('Component error caught by ErrorBoundary', {
      error: error.message,
      context: this.props.context,
      componentStack: errorInfo.componentStack?.slice(0, 500), // Limit stack size
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Algo salió mal
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              Ocurrió un error inesperado. Por favor intenta de nuevo.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-red-500 cursor-pointer">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="text-xs text-red-500 font-mono mt-2 p-2 bg-red-50 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-3">
            {this.props.showRefreshButton !== false && (
              <Button
                onClick={this.handleReset}
                variant="primary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Intentar de nuevo
              </Button>
            )}
            {this.props.showHomeLink && (
              <Link href="/dashboard">
                <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
                  Ir al inicio
                </Button>
              </Link>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
