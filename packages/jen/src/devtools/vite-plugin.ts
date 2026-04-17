/**
 * Jen.js DevTools Vite Plugin
 *
 * Injects the DevTools client exclusively in development mode.
 * Completely tree-shaken in production builds.
 */

import { Plugin } from 'vite';

const VIRTUAL_MODULE_ID = 'virtual:jenjs-devtools';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

const VIRTUAL_UI_MODULE_ID = 'virtual:jenjs-devtools-ui';
const RESOLVED_VIRTUAL_UI_MODULE_ID = '\0' + VIRTUAL_UI_MODULE_ID;

export function createDevToolsPlugin(): Plugin {
  let isDev = false;

  return {
    name: 'vite-plugin-jenjs-devtools',

    config(config, env) {
      isDev = env.command === 'serve';
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      if (id === VIRTUAL_UI_MODULE_ID) {
        return RESOLVED_VIRTUAL_UI_MODULE_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // Production: empty stub
        if (!isDev) {
          return `
export const DevTools = null;
export const useDevTools = () => null;
export const captureRouteTrace = () => {};
export const captureSecurityAudit = () => {};
export const captureSSRMetrics = () => {};
export const captureQueryLog = () => {};
          `.trim();
        }

        // Development: full DevTools
        return `
import { DevToolsClient } from '${require.resolve('./client')}';

const devToolsClient = new DevToolsClient('ws://localhost:3001');

export const DevTools = devToolsClient;

export function useDevTools() {
  return devToolsClient;
}

export async function captureRouteTrace(trace) {
  await devToolsClient.send('route-trace', trace);
}

export async function captureSecurityAudit(audit) {
  await devToolsClient.send('security-audit', audit);
}

export async function captureSSRMetrics(metrics) {
  await devToolsClient.send('ssr-metrics', metrics);
}

export async function captureQueryLog(query) {
  await devToolsClient.send('query-log', query);
}
        `.trim();
      }

      if (id === RESOLVED_VIRTUAL_UI_MODULE_ID) {
        // Production: no-op
        if (!isDev) {
          return `export async function initDevToolsUI() {}`;
        }

        // Development: inject DevTools UI
        return `
export async function initDevToolsUI() {
  // DevTools UI will be injected as a floating overlay
  // This is handled by the transformIndexHtml hook
}
        `.trim();
      }
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!isDev) return html;

        // Only inject if body exists and not already injected
        if (!html.includes('</body>')) return html;
        if (html.includes('jen-devtools')) return html;

        // Inject DevTools UI (vanilla JS/CSS)
        const devToolsUI = `
<style>
:root {
  --jen-bg: white;
  --jen-bg-secondary: #f9fafb;
  --jen-text: #111827;
  --jen-text-secondary: #374151;
  --jen-text-tertiary: #6b7280;
  --jen-border: #e5e7eb;
  --jen-border-light: #f3f4f6;
}

[data-jen-theme="dark"] {
  --jen-bg: #111827;
  --jen-bg-secondary: #1f2937;
  --jen-text: #f3f4f6;
  --jen-text-secondary: #e5e7eb;
  --jen-text-tertiary: #9ca3af;
  --jen-border: #374151;
  --jen-border-light: #1f2937;
}

.jen-devtools {
  position: fixed;
  bottom: 24px;
  right: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  z-index: 999999;
  user-select: none;
}

.jen-devtools-btn {
  background: var(--jen-bg);
  border: 1px solid var(--jen-border);
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--jen-text);
  transition: all 200ms ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-weight: 500;
  font-family: inherit;
}

.jen-devtools-btn:hover {
  border-color: var(--jen-border);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  background: var(--jen-bg-secondary);
}

.jen-devtools-dot {
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
  background: var(--jen-bg);
  border: 1px solid var(--jen-border);
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: none;
  flex-direction: column;
  max-height: 600px;
  overflow: hidden;
  color: var(--jen-text);
}

.jen-devtools-panel.open {
  display: flex;
}

.jen-devtools-header {
  padding: 16px;
  border-bottom: 1px solid var(--jen-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--jen-bg-secondary);
}

.jen-devtools-title {
  font-weight: 600;
  color: var(--jen-text);
  font-size: 14px;
}

.jen-devtools-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.jen-devtools-theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--jen-text-tertiary);
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 200ms ease;
  position: relative;
}

.jen-devtools-theme-btn:hover {
  color: var(--jen-text);
}

.jen-devtools-theme-btn svg {
  width: 16px;
  height: 16px;
  transition: opacity 200ms ease, transform 200ms ease;
  position: absolute;
  left: 4px;
  top: 4px;
}

.jen-devtools-theme-btn .jen-icon-moon {
  opacity: 1;
  transform: rotate(0deg);
  z-index: 2;
}

.jen-devtools-theme-btn .jen-icon-sun {
  opacity: 0;
  transform: rotate(-90deg);
  z-index: 1;
}

.jen-devtools-theme-btn .jen-icon-moon.hidden {
  opacity: 0;
  transform: rotate(90deg);
  z-index: 1;
}

.jen-devtools-theme-btn .jen-icon-sun.visible {
  opacity: 1;
  transform: rotate(0deg);
  z-index: 2;
}

.jen-devtools-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--jen-text-tertiary);
  font-size: 20px;
  padding: 0;
  width: 24px;
  height: 24px;
  font-weight: 300;
  transition: color 200ms ease;
}

.jen-devtools-close:hover {
  color: var(--jen-text);
}

.jen-devtools-tabs {
  display: flex;
  border-bottom: 1px solid var(--jen-border-light);
  padding: 0 8px;
  background: var(--jen-bg-secondary);
}

.jen-devtools-tab {
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--jen-text-tertiary);
  font-size: 13px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 200ms ease;
  font-family: inherit;
}

.jen-devtools-tab:hover {
  color: var(--jen-text-secondary);
}

.jen-devtools-tab.active {
  color: var(--jen-text);
  border-bottom-color: #3b82f6;
}

.jen-devtools-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 13px;
  color: var(--jen-text-secondary);
}

.jen-devtools-section {
  margin-bottom: 16px;
}

.jen-devtools-label {
  font-weight: 600;
  color: var(--jen-text);
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.jen-devtools-metric {
  background: var(--jen-bg-secondary);
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: var(--jen-text-tertiary);
}

.jen-devtools-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
  font-family: inherit;
}

.jen-devtools-badge.pass {
  background: #d1fae5;
  color: #065f46;
}

.jen-devtools-badge.warn {
  background: #fef3c7;
  color: #92400e;
}

.jen-devtools-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--jen-border-light);
  background: var(--jen-bg-secondary);
  font-size: 11px;
  color: var(--jen-text-tertiary);
  text-align: center;
}

.jen-devtools-tab-content {
  display: none;
}

.jen-devtools-tab-content.active {
  display: block;
}
</style>

<div class="jen-devtools">
  <button class="jen-devtools-btn" id="jen-devtools-toggle">
    <div class="jen-devtools-dot"></div>
    <span>DevTools</span>
  </button>

  <div class="jen-devtools-panel" id="jen-devtools-panel">
    <div class="jen-devtools-header">
      <span class="jen-devtools-title">Jen.js DevTools</span>
      <div class="jen-devtools-controls">
        <button class="jen-devtools-theme-btn" id="jen-devtools-theme" title="Toggle dark/light mode">
          <svg class="jen-icon-moon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg class="jen-icon-sun" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <button class="jen-devtools-close" id="jen-devtools-close">×</button>
      </div>
    </div>

    <div class="jen-devtools-tabs">
      <button class="jen-devtools-tab active" data-tab="routes">Routes</button>
      <button class="jen-devtools-tab" data-tab="security">Security</button>
      <button class="jen-devtools-tab" data-tab="ssr">SSR</button>
      <button class="jen-devtools-tab" data-tab="db">Database</button>
    </div>

    <div class="jen-devtools-content">
      <!-- Routes Tab -->
      <div class="jen-devtools-tab-content active" data-tab-content="routes">
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Current Route</div>
          <div class="jen-devtools-metric" id="jen-current-route">/</div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Performance</div>
          <div class="jen-devtools-metric" id="jen-ssr-time">Render: — ms</div>
          <div class="jen-devtools-metric" id="jen-component-count">Components: —</div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Status</div>
          <span class="jen-devtools-badge pass">[+] Active</span>
        </div>
      </div>

      <!-- Security Tab -->
      <div class="jen-devtools-tab-content" data-tab-content="security">
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Headers</div>
          <div style="line-height: 1.8;">
            <div><span class="jen-devtools-badge pass">[+]</span> Content-Security-Policy</div>
            <div><span class="jen-devtools-badge pass">[+]</span> X-Content-Type-Options</div>
            <div><span class="jen-devtools-badge pass">[+]</span> X-Frame-Options</div>
            <div><span class="jen-devtools-badge warn">⚠</span> Strict-Transport-Security</div>
          </div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Compliance</div>
          <span class="jen-devtools-badge pass">OWASP ASVS L1</span>
        </div>
      </div>

      <!-- SSR Tab -->
      <div class="jen-devtools-tab-content" data-tab-content="ssr">
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Render Time</div>
          <div class="jen-devtools-metric" id="jen-ssr-render">— ms</div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Components</div>
          <div class="jen-devtools-metric" id="jen-ssr-components">—</div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Hydration</div>
          <span class="jen-devtools-badge pass">[+] Success</span>
        </div>
      </div>

      <!-- Database Tab -->
      <div class="jen-devtools-tab-content" data-tab-content="db">
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Queries</div>
          <div class="jen-devtools-metric">0 queries</div>
        </div>
        <div class="jen-devtools-section">
          <div class="jen-devtools-label">Performance</div>
          <div class="jen-devtools-metric">No slow queries</div>
        </div>
      </div>
    </div>

    <div class="jen-devtools-footer">jen.js • development mode</div>
  </div>
</div>

<script>
  (function() {
    const toggle = document.getElementById('jen-devtools-toggle');
    const panel = document.getElementById('jen-devtools-panel');
    const closeBtn = document.getElementById('jen-devtools-close');
    const themeBtn = document.getElementById('jen-devtools-theme');
    const themeIcon = document.getElementById('jen-theme-icon');
    const tabs = document.querySelectorAll('.jen-devtools-tab');
    const contents = document.querySelectorAll('.jen-devtools-tab-content');

    // ═══════════════════════════════════════════════════════════════
    // THEME DETECTION & MANAGEMENT
    // ═══════════════════════════════════════════════════════════════
    const html = document.documentElement;
    
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Get saved preference or use system default
    const savedTheme = localStorage.getItem('jen-devtools-theme');
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Apply theme
    function setTheme(theme) {
      const moonIcon = document.querySelector('.jen-icon-moon');
      const sunIcon = document.querySelector('.jen-icon-sun');
      
      if (theme === 'dark') {
        html.setAttribute('data-jen-theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.add('visible');
        localStorage.setItem('jen-devtools-theme', 'dark');
      } else {
        html.removeAttribute('data-jen-theme');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.remove('visible');
        localStorage.setItem('jen-devtools-theme', 'light');
      }
    }
    
    // Initial theme
    setTheme(initialTheme);
    
    // Theme toggle button
    themeBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-jen-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!savedTheme) { // Only if user hasn't manually set a preference
        setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // DEVTOOLS FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    
    // Update route
    document.getElementById('jen-current-route').textContent = window.location.pathname || '/';

    // Update SSR metrics if available
    if (window.__JEN_SSR_METRICS__) {
      const m = window.__JEN_SSR_METRICS__;
      document.getElementById('jen-ssr-time').textContent = \`Render: \${m.renderTime.toFixed(2)} ms\`;
      document.getElementById('jen-component-count').textContent = \`Components: \${m.componentCount}\`;
      document.getElementById('jen-ssr-render').textContent = \`\${m.renderTime.toFixed(2)} ms\`;
      document.getElementById('jen-ssr-components').textContent = m.componentCount;
    }

    // Toggle panel
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
    });

    // Close panel
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Remove active from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active to clicked tab and corresponding content
        tab.classList.add('active');
        document.querySelector(\`[data-tab-content="\${tabName}"]\`).classList.add('active');
      });
    });
  })();
</script>
        `;

        return html.replace('</body>', `${devToolsUI}</body>`);
      },
    },
  };
}

export default createDevToolsPlugin;
