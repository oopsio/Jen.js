import { h, Component, ComponentType } from 'preact';

export interface ErrorInfo {
  componentStack?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: preact.ComponentChildren;
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Boundary component - catches errors in the component tree
 * Handles both SSR and client-side rendering errors
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error(
        '[ErrorBoundary] Component stack:',
        errorInfo.componentStack,
      );
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;

      if (Fallback) {
        return h(Fallback, {
          error: this.state.error,
          reset: this.reset,
        });
      }

      // Default error UI
      return h('div', {
        style: {
          padding: '2rem',
          background: '#fee',
          border: '2px solid #f00',
          borderRadius: '8px',
          color: '#000',
          fontFamily: 'monospace',
        },
        children: [
          h(
            'h2',
            { style: { color: '#f00', margin: '0 0 1rem 0' } },
            '⚠️ Error',
          ),
          h('pre', {
            style: {
              background: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
            },
            children: this.state.error.message,
          }),
          h('button', {
            onClick: this.reset,
            style: {
              padding: '8px 16px',
              background: '#f00',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            },
            children: 'Try Again',
          }),
        ],
      });
    }

    return this.props.children;
  }
}
