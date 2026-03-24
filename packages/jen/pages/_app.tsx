import { h, VNode } from 'preact';
import type { AppComponentProps } from '../src/core/app-shell';
import { GoogleFont } from '../src/fonts/google';
import './app-shell.css';

const inter = GoogleFont('Inter', {
  weight: [400, 700],
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Global App Shell Component (_app.tsx)
 *
 * This wraps every page and provides:
 * - Global styles and fonts
 * - Persistent UI elements (navbar, sidebar, footer)
 * - Global state management
 * - Layout that doesn't unmount during page transitions
 *
 * The Component prop is the current page, pageProps are its data.
 */
export default function App({ Component, pageProps, children }: AppComponentProps & { children?: VNode }): VNode {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Persistent Navbar */}
      <nav
        style={{
          background: '#1a1a2e',
          color: '#fff',
          padding: '1rem 2rem',
          fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif`,
          borderBottom: '2px solid #00ff00',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Jen.js</h2>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
            Home
          </a>
          <a href="/test" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
            Test
          </a>
        </div>
      </nav>

      {/* Page Content - This is where each page renders */}
      <main style={{ flex: 1, fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif` }}>
        {children ? children : h(Component, pageProps)}
      </main>

      {/* Persistent Footer */}
      <footer
        style={{
          background: '#0f0f1e',
          color: '#888',
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid #333',
          fontSize: '0.875rem',
        }}
      >
        <p>© 2025 Jen.js - The Next.js-Level Framework Built with Bun, Vite & Preact</p>
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          <a href="https://github.com/oopsio/jen.js" style={{ color: '#00ff00', textDecoration: 'none' }}>
            GitHub
          </a>
          {' • '}
          <a href="https://docs.jen.js" style={{ color: '#00ff00', textDecoration: 'none' }}>
            Docs
          </a>
        </p>
      </footer>
    </div>
  );
}
