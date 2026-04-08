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
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, Inter, Roboto, sans-serif',
          color: '#e2e8f0',
        },
        children: [
          h('div', {
            style: {
              background: '#1e1e24',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }
          }, [
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid #333',
                paddingBottom: '1rem',
              }
            }, [
              h('div', {
                style: {
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }
              }, '!'),
              h('h2', { 
                style: { 
                  margin: 0, 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#f8fafc',
                } 
              }, 'Unhandled Runtime Error')
            ]),
            h('div', {
              style: {
                fontSize: '1.125rem',
                color: '#ef4444',
                fontWeight: '500',
                wordBreak: 'break-word',
              }
            }, this.state.error.message),
            h('div', {
              style: {
                background: '#0f0f12',
                borderRadius: '8px',
                border: '1px solid #27272a',
                overflow: 'hidden',
              }
            }, [
              h('div', {
                style: {
                  background: '#18181b',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  borderBottom: '1px solid #27272a',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }
              }, 'Stack Trace'),
              h('pre', {
                style: {
                  margin: 0,
                  padding: '1rem',
                  overflowX: 'auto',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  color: '#d4d4d8',
                },
                children: this.state.error.stack || this.state.error.message,
              })
            ]),
            this.state.errorInfo && this.state.errorInfo.componentStack ? h('div', {
              style: {
                background: '#0f0f12',
                borderRadius: '8px',
                border: '1px solid #27272a',
                overflow: 'hidden',
              }
            }, [
              h('div', {
                style: {
                  background: '#18181b',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  borderBottom: '1px solid #27272a',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }
              }, 'Component Stack'),
              h('pre', {
                style: {
                  margin: 0,
                  padding: '1rem',
                  overflowX: 'auto',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  color: '#d4d4d8',
                },
                children: this.state.errorInfo.componentStack,
              })
            ]) : null,
            h('div', {
              style: {
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
              }
            }, [
              h('button', {
                onClick: this.reset,
                style: {
                  padding: '10px 20px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                },
                // Quick inline hover styles simulator
                onMouseOver: (e: any) => e.target.style.background = '#f1f5f9',
                onMouseOut: (e: any) => e.target.style.background = '#ffffff',
                children: 'Try Again'
              })
            ])
          ])
        ]
      });
    }

    return this.props.children;
  }
}
