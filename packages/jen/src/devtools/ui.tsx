/**
 * DevTools UI Overlay
 * Old School 2014-2018 Aesthetic (Retro Minimalist)
 */

import { Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { DevToolsClient } from './client.js';
import type {
  RouteMatchTrace,
  SecurityAuditResult,
  SSRMetrics,
  QueryLog,
} from './types.js';

const styles = `
.jen-devtools-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  z-index: 999999;
  user-select: none;
}

.jen-devtools-widget {
  background: #1a1a1a;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 0;
  border-radius: 0;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  min-width: 300px;
  max-width: 600px;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.jen-devtools-header {
  background: #00ff00;
  color: #000;
  padding: 8px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.jen-devtools-close {
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jen-devtools-close:hover {
  background: #00cc00;
}

.jen-devtools-tabs {
  display: flex;
  background: #0a0a0a;
  border-bottom: 1px solid #00ff00;
}

.jen-devtools-tab {
  flex: 1;
  padding: 6px;
  cursor: pointer;
  border: none;
  background: none;
  color: #00ff00;
  border-bottom: 2px solid transparent;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.jen-devtools-tab.active {
  border-bottom: 2px solid #00ff00;
  background: #0a0a0a;
}

.jen-devtools-content {
  overflow-y: auto;
  padding: 8px;
  flex: 1;
}

.jen-devtools-section {
  margin-bottom: 12px;
}

.jen-devtools-section-title {
  color: #ffff00;
  font-weight: bold;
  margin-bottom: 4px;
}

.jen-devtools-status {
  display: inline-block;
  padding: 2px 6px;
  border: 1px solid #00ff00;
  margin-right: 4px;
}

.jen-devtools-status.pass {
  background: #00ff00;
  color: #000;
}

.jen-devtools-status.fail {
  background: #ff0000;
  color: #fff;
}

.jen-devtools-status.warn {
  background: #ffff00;
  color: #000;
}

.jen-devtools-metric {
  margin: 4px 0;
  line-height: 1.4;
}

.jen-devtools-log {
  background: #0a0a0a;
  padding: 4px;
  margin: 2px 0;
  border-left: 2px solid #00ff00;
  font-size: 10px;
}

.jen-devtools-footer {
  border-top: 1px solid #00ff00;
  padding: 4px;
  text-align: right;
  color: #888;
  font-size: 9px;
}
`;

interface DevToolsUIProps {
  wsUrl?: string;
}

export function DevToolsUI({ wsUrl = 'ws://localhost:3001' }: DevToolsUIProps) {
  const [activeTab, setActiveTab] = useState<
    'routes' | 'security' | 'ssr' | 'db'
  >('routes');
  const [isOpen, setIsOpen] = useState(true);
  const [routes, setRoutes] = useState<RouteMatchTrace[]>([]);
  const [security, setSecurity] = useState<SecurityAuditResult | null>(null);
  const [ssr, setSSR] = useState<SSRMetrics | null>(null);
  const [queries, setQueries] = useState<QueryLog[]>([]);

  useEffect(() => {
    const client = new DevToolsClient(wsUrl);

    const unsubRoutes = client.on('route-trace', (data: RouteMatchTrace) => {
      setRoutes((prev) => [...prev, data]);
    });

    const unsubSecurity = client.on(
      'security-audit',
      (data: SecurityAuditResult) => {
        setSecurity(data);
      },
    );

    const unsubSSR = client.on('ssr-metrics', (data: SSRMetrics) => {
      setSSR(data);
    });

    const unsubDb = client.on('query-log', (data: QueryLog) => {
      setQueries((prev) => [...prev, data]);
    });

    return () => {
      unsubRoutes();
      unsubSecurity();
      unsubSSR();
      unsubDb();
      client.close();
    };
  }, [wsUrl]);

  if (!isOpen) {
    return (
      <div class="jen-devtools-overlay">
        <button
          class="jen-devtools-close"
          onClick={() => setIsOpen(true)}
          title="Open DevTools"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <Fragment>
      <style>{styles}</style>
      <div class="jen-devtools-overlay">
        <div class="jen-devtools-widget">
          <div class="jen-devtools-header">
            <span>Jen.js DevTools</span>
            <button
              class="jen-devtools-close"
              onClick={() => setIsOpen(false)}
              title="Close DevTools"
            >
              ×
            </button>
          </div>

          <div class="jen-devtools-tabs">
            <button
              class={`jen-devtools-tab ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              Routes
            </button>
            <button
              class={`jen-devtools-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              class={`jen-devtools-tab ${activeTab === 'ssr' ? 'active' : ''}`}
              onClick={() => setActiveTab('ssr')}
            >
              SSR
            </button>
            <button
              class={`jen-devtools-tab ${activeTab === 'db' ? 'active' : ''}`}
              onClick={() => setActiveTab('db')}
            >
              DB
            </button>
          </div>

          <div class="jen-devtools-content">
            {activeTab === 'routes' && (
              <div class="jen-devtools-section">
                <div class="jen-devtools-section-title">Route Traces</div>
                {routes.length === 0 ? (
                  <div class="jen-devtools-metric">Waiting for requests...</div>
                ) : (
                  routes.slice(-5).map((r) => (
                    <div class="jen-devtools-log">
                      {r.matched ? '✓' : '✗'} {r.pathname}
                      {Object.keys(r.params).length > 0 && (
                        <div style={{ color: '#ffff00' }}>
                          {JSON.stringify(r.params)}
                        </div>
                      )}
                      <div style={{ color: '#888' }}>
                        {r.executionTime.toFixed(2)}ms
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div class="jen-devtools-section">
                <div class="jen-devtools-section-title">Security Audit</div>
                {security ? (
                  <Fragment>
                    <div
                      class={`jen-devtools-status ${security.overallCompliant ? 'pass' : 'fail'}`}
                    >
                      {security.overallCompliant ? '✓ COMPLIANT' : '✗ ISSUES'}
                    </div>
                    {security.headers.map((h) => (
                      <div class="jen-devtools-metric">
                        <span
                          style={{ color: h.compliant ? '#00ff00' : '#ff0000' }}
                        >
                          {h.compliant ? '✓' : '✗'} {h.name}
                        </span>
                        <div style={{ color: '#888', marginLeft: '16px' }}>
                          {h.value || 'missing'}
                        </div>
                      </div>
                    ))}
                  </Fragment>
                ) : (
                  <div class="jen-devtools-metric">Awaiting audit...</div>
                )}
              </div>
            )}

            {activeTab === 'ssr' && (
              <div class="jen-devtools-section">
                <div class="jen-devtools-section-title">SSR Metrics</div>
                {ssr ? (
                  <Fragment>
                    <div class="jen-devtools-metric">
                      Render:{' '}
                      <span style={{ color: '#00ff00' }}>
                        {ssr.renderTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div class="jen-devtools-metric">
                      Components: {ssr.componentCount}
                    </div>
                    <div class="jen-devtools-metric">
                      Hydration:{' '}
                      <span
                        style={{
                          color:
                            ssr.hydrationStatus === 'success'
                              ? '#00ff00'
                              : ssr.hydrationStatus === 'mismatch'
                                ? '#ff0000'
                                : '#ffff00',
                        }}
                      >
                        {ssr.hydrationStatus}
                      </span>
                    </div>
                  </Fragment>
                ) : (
                  <div class="jen-devtools-metric">Awaiting metrics...</div>
                )}
              </div>
            )}

            {activeTab === 'db' && (
              <div class="jen-devtools-section">
                <div class="jen-devtools-section-title">Database Queries</div>
                {queries.length === 0 ? (
                  <div class="jen-devtools-metric">No queries yet</div>
                ) : (
                  queries.slice(-5).map((q) => (
                    <div class="jen-devtools-log">
                      <div
                        style={{
                          color: q.status === 'error' ? '#ff0000' : '#00ff00',
                        }}
                      >
                        {q.status === 'error' ? '✗' : '✓'}{' '}
                        {q.duration.toFixed(0)}ms
                      </div>
                      <div style={{ color: '#888' }}>{q.query}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div class="jen-devtools-footer">jen.js devtools v1</div>
        </div>
      </div>
    </Fragment>
  );
}

export async function initDevToolsUI(): Promise<void> {
  const container = document.createElement('div');
  container.id = 'jen-devtools-root';
  document.body.appendChild(container);

  // Mount the DevTools UI
  // This would use preact.render in the actual implementation
}
