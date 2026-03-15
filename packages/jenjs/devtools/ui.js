/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
/**
 * Generates the HTML for the DevTools panel
 */
export function getHTML() {
    return `
<div class="jen-devtools-panel">
  <div class="jen-devtools-header">
    <div class="jen-devtools-title">
      <span class="jen-devtools-logo">️</span>
      Jen.js DevTools
    </div>
    <div class="jen-devtools-controls">
      <button class="jen-devtools-theme-toggle" title="Toggle theme"></button>
      <button class="jen-devtools-minimize" title="Minimize">−</button>
      <button class="jen-devtools-close" title="Close"></button>
    </div>
  </div>

  <div class="jen-devtools-content">
    <div class="jen-devtools-sidebar">
      <div class="jen-devtools-search-container">
        <input
          type="text"
          class="jen-devtools-search"
          placeholder="Search components..."
        />
        <div class="jen-search-results"></div>
      </div>

      <div class="jen-devtools-tree"></div>
    </div>

    <div class="jen-devtools-main">
      <div class="jen-devtools-tabs">
        <button class="jen-devtools-tab active" data-tab="inspector">
          Inspector
        </button>
        <button class="jen-devtools-tab" data-tab="console">
          Console
        </button>
        <button class="jen-devtools-tab" data-tab="network">
          Network
        </button>
        <button class="jen-devtools-tab" data-tab="performance">
          Performance
        </button>
      </div>

      <div class="jen-devtools-tab-contents">
        <!-- Inspector Tab -->
        <div class="jen-devtools-tab-content active" data-tab="inspector">
          <div class="jen-devtools-inspector">
            <div class="jen-inspector-empty">
              <p>Select a component to inspect</p>
            </div>
          </div>
        </div>

        <!-- Console Tab -->
        <div class="jen-devtools-tab-content" data-tab="console">
          <div class="jen-console">
            <div class="jen-console-logs"></div>
            <div class="jen-console-input-container">
              <input
                type="text"
                class="jen-console-input"
                placeholder="Type command..."
              />
            </div>
          </div>
        </div>

        <!-- Network Tab -->
        <div class="jen-devtools-tab-content" data-tab="network">
          <div class="jen-network">
            <div class="jen-network-list"></div>
          </div>
        </div>

        <!-- Performance Tab -->
        <div class="jen-devtools-tab-content" data-tab="performance">
          <div class="jen-performance">
            <div class="jen-performance-stats">
              <div class="jen-stat">
                <span class="jen-stat-label">FPS</span>
                <span class="jen-stat-value" id="jen-fps">60</span>
              </div>
              <div class="jen-stat">
                <span class="jen-stat-label">Render Time</span>
                <span class="jen-stat-value" id="jen-render-time">0ms</span>
              </div>
              <div class="jen-stat">
                <span class="jen-stat-label">Updates</span>
                <span class="jen-stat-value" id="jen-updates">0</span>
              </div>
              <div class="jen-stat">
                <span class="jen-stat-label">Memory</span>
                <span class="jen-stat-value" id="jen-memory">0MB</span>
              </div>
            </div>
            <canvas id="jen-performance-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="jen-devtools-footer">
        <button class="jen-devtools-export"> Export State</button>
      </div>
    </div>
  </div>

  <div class="jen-devtools-resize"></div>
</div>
  `;
}
/**
 * Generates the CSS for the DevTools panel
 */
export function getStyles() {
    return `
:root {
  --jen-color-bg: #111111;
  --jen-color-bg-secondary: #1a1a1a;
  --jen-color-fg: #f0f0f0;
  --jen-color-fg-muted: #a0a0a0;
  --jen-color-border: #2a2a2a;
  --jen-color-accent: #0ea5e9;
  --jen-color-success: #10b981;
  --jen-color-error: #ef4444;
  --jen-color-warning: #f59e0b;
  --jen-color-info: #3b82f6;
}

.light-theme {
  --jen-color-bg: #ffffff;
  --jen-color-fg: #1e1e1e;
  --jen-color-border: #d0d0d0;
  --jen-color-accent: #0078d4;
  --jen-color-success: #107c10;
  --jen-color-error: #d13438;
  --jen-color-warning: #ffb900;
  --jen-color-info: #0078d4;
}

#__jen_devtools__ {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: var(--jen-color-fg);
  background: var(--jen-color-bg);
  z-index: 99999;
  position: fixed;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
}

.jen-devtools-panel {
  width: 900px;
  height: 650px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--jen-color-bg);
  border: 1px solid var(--jen-color-border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}

.jen-devtools-panel.minimized {
  height: auto;
}

.jen-devtools-panel.minimized .jen-devtools-content {
  display: none;
}

.jen-devtools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--jen-color-border);
  background: var(--jen-color-bg-secondary);
  cursor: move;
  user-select: none;
}

.jen-devtools-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.jen-devtools-logo {
  font-size: 16px;
}

.jen-devtools-controls {
  display: flex;
  gap: 4px;
}

.jen-devtools-controls button {
  background: transparent;
  border: none;
  color: var(--jen-color-fg-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.jen-devtools-controls button:hover {
  background: var(--jen-color-border);
  color: var(--jen-color-fg);
}

.jen-devtools-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.jen-devtools-sidebar {
  width: 280px;
  border-right: 1px solid var(--jen-color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--jen-color-bg-secondary);
}

.jen-devtools-search-container {
  padding: 8px;
  border-bottom: 1px solid var(--jen-color-border);
}

.jen-devtools-search {
  width: 100%;
  padding: 8px 10px;
  background: var(--jen-color-bg);
  border: 1px solid var(--jen-color-border);
  border-radius: 6px;
  color: var(--jen-color-fg);
  font-size: 12px;
  transition: all 0.2s;
}

.jen-devtools-search::placeholder {
  color: var(--jen-color-fg-muted);
}

.jen-devtools-search:focus {
  outline: none;
  border-color: var(--jen-color-accent);
  background: var(--jen-color-bg-secondary);
}

.jen-search-results {
  max-height: 150px;
  overflow-y: auto;
}

.jen-search-result {
  padding: 6px 8px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.2s;
}

.jen-search-result:hover {
  background: var(--jen-color-border);
  border-left-color: var(--jen-color-accent);
}

.jen-devtools-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.jen-tree-node {
  margin: 2px 0;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.jen-tree-node:hover {
  background: var(--jen-color-border);
}

.jen-tree-node.selected {
  background: var(--jen-color-accent);
  color: white;
}

.jen-tree-node-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

.jen-tree-icon {
  width: 12px;
  text-align: center;
  font-size: 10px;
}

.jen-tree-name {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jen-tree-children {
  padding-left: 12px;
  margin: 2px 0;
}

.jen-devtools-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.jen-devtools-tabs {
  display: flex;
  border-bottom: 1px solid var(--jen-color-border);
  gap: 0;
  padding: 0;
}

.jen-devtools-tab {
  background: transparent;
  border: none;
  color: var(--jen-color-fg-muted);
  padding: 12px 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.jen-devtools-tab:hover {
  color: var(--jen-color-fg);
}

.jen-devtools-tab.active {
  color: var(--jen-color-accent);
  border-bottom-color: var(--jen-color-accent);
}

.jen-devtools-tab-contents {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.jen-devtools-tab-content {
  flex: 1;
  display: none;
  overflow-y: auto;
  padding: 16px;
  background: var(--jen-color-bg);
}

.jen-devtools-tab-content.active {
  display: block;
}

.jen-devtools-inspector {
  width: 100%;
}

.jen-inspector-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--jen-color-border);
}

.jen-inspector-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--jen-color-border);
}

.jen-inspector-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.jen-inspector-type {
  font-size: 11px;
  color: var(--jen-color-info);
  background: var(--jen-color-border);
  padding: 2px 6px;
  border-radius: 3px;
}

.jen-inspector-section {
  margin-bottom: 20px;
}

.jen-inspector-section h4 {
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--jen-color-fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.8;
}

.jen-inspector-props,
.jen-inspector-state,
.jen-inspector-hooks,
.jen-inspector-events {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.jen-prop-item,
.jen-state-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--jen-color-bg-secondary);
  border: 1px solid var(--jen-color-border);
  border-radius: 6px;
}

.jen-prop-key,
.jen-state-key {
  font-weight: 500;
  color: var(--jen-color-info);
  min-width: 100px;
  font-size: 12px;
}

.jen-prop-value,
.jen-state-value {
  flex: 1;
  padding: 6px 8px;
  background: var(--jen-color-bg);
  border: 1px solid var(--jen-color-border);
  border-radius: 4px;
  color: var(--jen-color-fg);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  transition: all 0.2s;
}

.jen-prop-value:focus,
.jen-state-value:focus {
  outline: none;
  border-color: var(--jen-color-accent);
}

.jen-prop-type,
.jen-state-type {
  font-size: 10px;
  color: var(--jen-color-warning);
  min-width: 50px;
  text-align: right;
}

.jen-hook-item {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: var(--jen-color-border);
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
}

.jen-hook-index {
  color: var(--jen-color-info);
  font-weight: 600;
  min-width: 40px;
}

.jen-hook-type {
  color: var(--jen-color-warning);
  min-width: 80px;
}

.jen-hook-value {
  flex: 1;
  color: var(--jen-color-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jen-event-item {
  padding: 6px 8px;
  background: var(--jen-color-border);
  border-radius: 4px;
  border-left: 3px solid var(--jen-color-info);
}

.jen-event-name {
  font-weight: 500;
  color: var(--jen-color-info);
}

.jen-console {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.jen-console-logs {
  flex: 1;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
}

.jen-console-log {
  padding: 6px;
  border-bottom: 1px solid var(--jen-color-border);
  display: flex;
  gap: 8px;
}

.jen-console-log.error {
  color: var(--jen-color-error);
  background: rgba(244, 135, 113, 0.1);
}

.jen-console-log.warn {
  color: var(--jen-color-warning);
  background: rgba(220, 220, 170, 0.1);
}

.jen-console-log.info {
  color: var(--jen-color-info);
}

.jen-console-log-time {
  color: var(--jen-color-border);
  min-width: 60px;
}

.jen-console-log-content {
  flex: 1;
  word-break: break-all;
}

.jen-console-input-container {
  padding: 8px;
  border-top: 1px solid var(--jen-color-border);
}

.jen-console-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--jen-color-bg);
  border: 1px solid var(--jen-color-border);
  border-radius: 4px;
  color: var(--jen-color-fg);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.jen-console-input:focus {
  outline: none;
  border-color: var(--jen-color-accent);
}

.jen-network {
  display: flex;
  flex-direction: column;
}

.jen-network-list {
  flex: 1;
  overflow-y: auto;
}

.jen-network-item {
  padding: 8px;
  border-bottom: 1px solid var(--jen-color-border);
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.jen-network-method {
  font-weight: 600;
  margin-right: 8px;
}

.jen-network-method.GET {
  color: var(--jen-color-info);
}

.jen-network-method.POST {
  color: var(--jen-color-success);
}

.jen-network-method.PUT {
  color: var(--jen-color-warning);
}

.jen-network-method.DELETE {
  color: var(--jen-color-error);
}

.jen-network-status {
  margin-left: 8px;
  font-weight: 600;
}

.jen-network-status.success {
  color: var(--jen-color-success);
}

.jen-network-status.error {
  color: var(--jen-color-error);
}

.jen-performance {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.jen-performance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.jen-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--jen-color-border);
  border-radius: 6px;
}

.jen-stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--jen-color-border);
}

.jen-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--jen-color-accent);
  font-family: 'Monaco', 'Menlo', monospace;
}

#jen-performance-chart {
  width: 100%;
  height: 200px;
  background: var(--jen-color-border);
  border-radius: 4px;
}

.jen-devtools-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--jen-color-border);
  display: flex;
  gap: 8px;
  background: var(--jen-color-bg-secondary);
}

.jen-devtools-export {
  padding: 8px 14px;
  background: var(--jen-color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.jen-devtools-export:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.jen-devtools-resize {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, var(--jen-color-border) 50%);
}

.jen-devtools-highlight {
  outline: 2px solid var(--jen-color-accent) !important;
  outline-offset: 2px !important;
}

#__jen_devtools__ {
  scrollbar-width: thin;
  scrollbar-color: var(--jen-color-border) transparent;
}

#__jen_devtools__ ::-webkit-scrollbar {
  width: 8px;
}

#__jen_devtools__ ::-webkit-scrollbar-track {
  background: transparent;
}

#__jen_devtools__ ::-webkit-scrollbar-thumb {
  background: var(--jen-color-border);
  border-radius: 4px;
}

#__jen_devtools__ ::-webkit-scrollbar-thumb:hover {
  background: var(--jen-color-accent);
}
  `;
}
/**
 * Inject styles into the document
 */
export function injectStyles() {
    if (document.getElementById("__jen_devtools_styles__")) {
        return; // Already injected
    }
    const styleEl = document.createElement("style");
    styleEl.id = "__jen_devtools_styles__";
    styleEl.textContent = getStyles();
    document.head.appendChild(styleEl);
}
