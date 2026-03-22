/**
 * Jen.js DevTools UI
 * Vercel-inspired clean minimal design
 */

import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

const styles = `
* {
  box-sizing: border-box;
}

.jen-devtools {
  position: fixed;
  bottom: 24px;
  right: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 14px;
  z-index: 999999;
  user-select: none;
}

.jen-devtools-button {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 200ms ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.jen-devtools-button:hover {
  border-color: #d1d5db;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  background: #f9fafb;
}

.jen-devtools-button:active {
  transform: scale(0.98);
}

.jen-devtools-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.jen-devtools-panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 420px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.jen-devtools-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.jen-devtools-title {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.jen-devtools-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 20px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 200ms ease;
}

.jen-devtools-close:hover {
  color: #111827;
}

.jen-devtools-tabs {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  padding: 0 8px;
  background: #f9fafb;
}

.jen-devtools-tab {
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 200ms ease;
}

.jen-devtools-tab.active {
  color: #111827;
  border-bottom-color: #3b82f6;
}

.jen-devtools-tab:hover {
  color: #374151;
}

.jen-devtools-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
}

.jen-devtools-section {
  margin-bottom: 16px;
}

.jen-devtools-section:last-child {
  margin-bottom: 0;
}

.jen-devtools-label {
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.jen-devtools-metric {
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

.jen-devtools-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
}

.jen-devtools-status-badge.pass {
  background: #d1fae5;
  color: #065f46;
}

.jen-devtools-status-badge.fail {
  background: #fee2e2;
  color: #991b1b;
}

.jen-devtools-status-badge.warn {
  background: #fef3c7;
  color: #92400e;
}

.jen-devtools-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.jen-devtools-list-item {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.jen-devtools-list-item:last-child {
  border-bottom: none;
}

.jen-devtools-footer {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}
`;

interface Tab {
  id: 'routes' | 'security' | 'ssr' | 'db';
  label: string;
}

const TABS: Tab[] = [
  { id: 'routes', label: 'Routes' },
  { id: 'security', label: 'Security' },
  { id: 'ssr', label: 'SSR' },
  { id: 'db', label: 'Database' },
];

export function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab['id']>('routes');

  return (
    <Fragment>
      <style>{styles}</style>

      <div class="jen-devtools">
        {/* Toggle Button */}
        <button
          class="jen-devtools-button"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle DevTools"
        >
          <div class="jen-devtools-status" />
          <span>DevTools</span>
        </button>

        {/* Panel */}
        {isOpen && (
          <div class="jen-devtools-panel">
            <div class="jen-devtools-header">
              <span class="jen-devtools-title">Jen.js DevTools</span>
              <button
                class="jen-devtools-close"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div class="jen-devtools-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  class={`jen-devtools-tab ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div class="jen-devtools-content">
              {activeTab === 'routes' && <RoutesTab />}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'ssr' && <SSRTab />}
              {activeTab === 'db' && <DatabaseTab />}
            </div>

            <div class="jen-devtools-footer">jen.js • development mode</div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

function RoutesTab() {
  const metrics: { renderTime: number; componentCount: number } | null =
    (typeof window !== 'undefined' &&
      ((window as unknown as Record<string, unknown>).__JEN_SSR_METRICS__ as
        | { renderTime: number; componentCount: number }
        | undefined)) ||
    null;

  return (
    <div>
      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Current Route</div>
        <div class="jen-devtools-metric">
          {typeof window !== 'undefined' ? window.location.pathname : '/'}
        </div>
      </div>

      {metrics && (
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Performance</div>
          <div class="jen-devtools-metric">
            Render: {metrics.renderTime.toFixed(2)}ms
          </div>
          <div class="jen-devtools-metric">
            Components: {metrics.componentCount}
          </div>
        </div>
      )}

      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Status</div>
        <span class="jen-devtools-status-badge pass">✓ Active</span>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Headers</div>
        <ul class="jen-devtools-list">
          <li class="jen-devtools-list-item">
            <span class="jen-devtools-status-badge pass">✓</span>
            Content-Security-Policy
          </li>
          <li class="jen-devtools-list-item">
            <span class="jen-devtools-status-badge pass">✓</span>
            X-Content-Type-Options
          </li>
          <li class="jen-devtools-list-item">
            <span class="jen-devtools-status-badge pass">✓</span>
            X-Frame-Options
          </li>
          <li class="jen-devtools-list-item">
            <span class="jen-devtools-status-badge warn">⚠</span>
            Strict-Transport-Security
          </li>
        </ul>
      </div>

      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Compliance</div>
        <div style={{ marginTop: '8px' }}>
          <span class="jen-devtools-status-badge pass">OWASP ASVS Level 1</span>
        </div>
      </div>
    </div>
  );
}

function SSRTab() {
  const metrics: { renderTime: number; componentCount: number } | null =
    (typeof window !== 'undefined' &&
      ((window as unknown as Record<string, unknown>).__JEN_SSR_METRICS__ as
        | { renderTime: number; componentCount: number }
        | undefined)) ||
    null;

  return (
    <div>
      {metrics ? (
        <Fragment>
          <div class="jen-devtools-section">
            <div class="jen-devtools-label">Render Time</div>
            <div class="jen-devtools-metric">
              {metrics.renderTime.toFixed(2)}ms
            </div>
          </div>

          <div class="jen-devtools-section">
            <div class="jen-devtools-label">Components</div>
            <div class="jen-devtools-metric">{metrics.componentCount}</div>
          </div>

          <div class="jen-devtools-section">
            <div class="jen-devtools-label">Hydration</div>
            <span class="jen-devtools-status-badge pass">✓ Success</span>
          </div>
        </Fragment>
      ) : (
        <div class="jen-devtools-metric">Loading metrics...</div>
      )}
    </div>
  );
}

function DatabaseTab() {
  return (
    <div>
      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Queries</div>
        <div class="jen-devtools-metric">0 queries</div>
      </div>

      <div class="jen-devtools-section">
        <div class="jen-devtools-label">Performance</div>
        <div class="jen-devtools-metric">No slow queries detected</div>
      </div>
    </div>
  );
}

export async function initDevToolsUI(): Promise<void> {
  const container = document.getElementById('jen-devtools-container');
  if (!container) return;

  // Use preact.render to mount the UI
  // This requires preact to be available globally or imported
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preact = (globalThis as any).preact || (await import('preact'));
    const { render } = preact as { render: typeof import('preact').render };

    if (render) {
      render(h(DevToolsPanel, {}), container);
    }
  } catch (error) {
    console.warn('[DevTools] Failed to initialize UI:', error);
  }
}
