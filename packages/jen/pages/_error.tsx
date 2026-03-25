import { VNode } from 'preact';
import type { ErrorFallbackProps } from '../src/core/error-boundary';
import { GoogleFont } from '../src/fonts/google';

const inter = GoogleFont('Inter', {
  weight: [400, 700],
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Error Page Component (_error.tsx)
 *
 * This component is rendered when:
 * 1. A page component throws an error during rendering
 * 2. Caught by Error Boundary on client or server
 *
 * Props:
 * - error: The actual Error object that was thrown
 * - reset: Function to reset the error state and try again
 */
export default function ErrorPage({ error, reset }: ErrorFallbackProps): VNode {
  const isDev =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f1e',
        color: '#fff',
        padding: '2rem',
        fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif`,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        {/* Error Icon */}
        <h1
          style={{
            fontSize: '4rem',
            margin: '0 0 1rem 0',
            fontWeight: 'bold',
            color: '#ff3366',
            textShadow: '0 0 20px #ff3366',
          }}
        >
          ⚠️
        </h1>

        {/* Error Title */}
        <h2
          style={{
            fontSize: '2rem',
            margin: '0 0 1rem 0',
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          Something Went Wrong
        </h2>

        {/* Error Message */}
        <p
          style={{
            fontSize: '1.1rem',
            color: '#aaa',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}
        >
          {error.message}
        </p>

        {/* Development Error Details */}
        {isDev && error && (
          <details
            style={{
              textAlign: 'left',
              background: '#1a1a2e',
              border: '2px solid #ff3366',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              cursor: 'pointer',
            }}
          >
            <summary
              style={{
                fontWeight: 'bold',
                color: '#ff3366',
                marginBottom: '1rem',
                cursor: 'pointer',
              }}
            >
              📋 Error Details (Development Only)
            </summary>
            <pre
              style={{
                background: '#0f0f1e',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.875rem',
                color: '#ff3366',
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {reset && (
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                background: '#00ff00',
                color: '#000',
                border: '2px solid #00ff00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'scale(1.05)';
                target.style.boxShadow = '0 0 20px #00ff00';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'scale(1)';
                target.style.boxShadow = 'none';
              }}
            >
              🔄 Try Again
            </button>
          )}

          <a
            href="/"
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              background: '#333',
              color: '#fff',
              border: '2px solid #666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'inline-block',
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.background = '#555';
              target.style.borderColor = '#00ff00';
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.background = '#333';
              target.style.borderColor = '#666';
            }}
          >
            🏠 Go Home
          </a>
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '3rem',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          Jen.js v1.0.0 • Error Page
        </p>
      </div>
    </div>
  );
}
