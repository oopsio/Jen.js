/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Jen.js DevTools - A comprehensive development tools panel for debugging Jen.js applications
 * Provides real-time component inspection, state/props editing, event logging, and performance monitoring
 */

import { getHTML } from "./ui.js";
import { createEventBus, type EventBus } from "./event-bus.js";
import { PersistenceManager } from "./persistence.js";
import { PluginSystem } from "./plugins.js";
import {
  ComponentTreeManager,
  type ComponentNode,
} from "./component-tree.js";
import { EventLogger, type LogEntry } from "./event-logger.js";
import { PerformanceMonitor } from "./performance.js";
import { SearchManager } from "./search.js";

export interface DevToolsConfig {
  enabled?: boolean;
  theme?: "light" | "dark";
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
  collapsedTabs?: Record<string, boolean>;
}

export class DevTools {
  private eventBus: EventBus;
  private persistence: PersistenceManager;
  private pluginSystem: PluginSystem;
  private componentTree: ComponentTreeManager;
  private eventLogger: EventLogger;
  private performanceMonitor: PerformanceMonitor;
  private searchManager: SearchManager;

  private config: Required<DevToolsConfig>;
  private isOpen = false;
  private panel: HTMLElement | null = null;
  private selectedComponent: ComponentNode | null = null;
  private theme: "light" | "dark" = "dark";

  constructor(config?: DevToolsConfig) {
    this.eventBus = createEventBus();
    this.persistence = new PersistenceManager();
    this.pluginSystem = new PluginSystem(this.eventBus);
    this.componentTree = new ComponentTreeManager(this.eventBus);
    this.eventLogger = new EventLogger();
    this.performanceMonitor = new PerformanceMonitor();
    this.searchManager = new SearchManager(this.componentTree);

    this.config = this.initializeConfig(config);

    if (this.config.enabled) {
      this.setup();
    }
  }

  private initializeConfig(userConfig?: DevToolsConfig): Required<DevToolsConfig> {
    const saved = this.persistence.loadConfig();
    const defaults: Required<DevToolsConfig> = {
      enabled: true,
      theme: "dark",
      position: { x: 20, y: 20 },
      size: { width: 800, height: 600 },
      minimized: false,
      collapsedTabs: {},
    };

    return {
      ...defaults,
      ...saved,
      ...userConfig,
    };
  }

  private setup() {
    this.registerHotkeys();
    this.setupInterceptors();
    this.injectPanel();
    this.attachEventListeners();
  }

  private registerHotkeys() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+J or Cmd+Shift+J to toggle DevTools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
        e.preventDefault();
        this.toggle();
      }
      // Escape to close
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  private setupInterceptors() {
    // Intercept console logs
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog(...args);
      this.eventLogger.log("console", "log", args);
    };

    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      this.eventLogger.log("console", "error", args);
    };

    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      originalWarn(...args);
      this.eventLogger.log("console", "warn", args);
    }; // Monitor performance
    this.performanceMonitor.start();

    // Monitor component lifecycle
    this.setupComponentInterception();
  }

  private setupComponentInterception() {
    // Hook into Preact's component lifecycle
    const originalRender = window.requestAnimationFrame;

    let frameCount = 0;
    const startTime = performance.now();

    const monitorFrame = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;
      const fps = Math.round((frameCount / elapsed) * 1000);
      this.performanceMonitor.recordFPS(fps);
      originalRender(monitorFrame);
    };

    originalRender(monitorFrame);
  }

  private injectPanel() {
    const container = document.createElement("div");
    container.id = "__jen_devtools__";
    container.innerHTML = getHTML();

    document.body.appendChild(container);
    this.panel = container;

    this.applyTheme();
  }

  private attachEventListeners() {
    if (!this.panel) return;

    // Toggle button
    const toggleBtn = this.panel.querySelector(".jen-devtools-toggle");
    toggleBtn?.addEventListener("click", () => this.toggle());

    // Minimize button
    const minimizeBtn = this.panel.querySelector(".jen-devtools-minimize");
    minimizeBtn?.addEventListener("click", () => this.toggleMinimize());

    // Theme toggle
    const themeToggle = this.panel.querySelector(
      ".jen-devtools-theme-toggle"
    );
    themeToggle?.addEventListener("click", () => this.cycleTheme());

    // Close button
    const closeBtn = this.panel.querySelector(".jen-devtools-close");
    closeBtn?.addEventListener("click", () => this.close());

    // Dragging
    this.setupDragging();

    // Resizing
    this.setupResizing();

    // Tab navigation
    this.setupTabs();

    // Tree navigation
    this.setupTreeNavigation();

    // Search
    this.setupSearch();

    // Export button
    const exportBtn = this.panel.querySelector(".jen-devtools-export");
    exportBtn?.addEventListener("click", () => this.export());
  }

  private setupDragging() {
    if (!this.panel) return;

    const header = this.panel.querySelector(".jen-devtools-header");
    if (!header) return;

    let isDragging = false;
    let currentX = this.config.position.x;
    let currentY = this.config.position.y;
    let initialX = 0;
    let initialY = 0;

    header.addEventListener("mousedown", ((e: Event) => {
      const me = e as MouseEvent;
      if ((me.target as HTMLElement).closest(".jen-devtools-controls")) return;
      isDragging = true;
      initialX = me.clientX - currentX;
      initialY = me.clientY - currentY;
    }) as EventListener);

    document.addEventListener("mousemove", ((e: Event) => {
      if (!isDragging || !this.panel) return;
      const me = e as MouseEvent;
      currentX = me.clientX - initialX;
      currentY = me.clientY - initialY;
      this.panel.style.left = `${currentX}px`;
      this.panel.style.top = `${currentY}px`;
    }) as EventListener);

    document.addEventListener("mouseup", () => {
      isDragging = false;
      this.config.position = { x: currentX, y: currentY };
      this.persistence.saveConfig(this.config);
    });
  }

  private setupResizing() {
    if (!this.panel) return;

    const handle = this.panel.querySelector(".jen-devtools-resize");
    if (!handle) return;

    let isResizing = false;
    let currentW = this.config.size.width;
    let currentH = this.config.size.height;
    let initialX = 0;
    let initialY = 0;

    handle.addEventListener("mousedown", ((e: Event) => {
      const me = e as MouseEvent;
      isResizing = true;
      initialX = me.clientX;
      initialY = me.clientY;
    }) as EventListener);

    document.addEventListener("mousemove", ((e: Event) => {
      if (!isResizing || !this.panel) return;
      const me = e as MouseEvent;
      const deltaX = me.clientX - initialX;
      const deltaY = me.clientY - initialY;
      currentW = Math.max(400, this.config.size.width + deltaX);
      currentH = Math.max(300, this.config.size.height + deltaY);
      this.panel.style.width = `${currentW}px`;
      this.panel.style.height = `${currentH}px`;
    }) as EventListener);

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        this.config.size = { width: currentW, height: currentH };
        this.persistence.saveConfig(this.config);
      }
      isResizing = false;
    });
  }

  private setupTabs() {
    if (!this.panel) return;

    const tabs = this.panel.querySelectorAll(".jen-devtools-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const tabName = (e.target as HTMLElement).dataset.tab;
        if (tabName) {
          this.selectTab(tabName);
        }
      });
    });
  }

  private setupTreeNavigation() {
    if (!this.panel) return;

    const tree = this.panel.querySelector(".jen-devtools-tree");
    if (!tree) return;

    // Click to select component
    tree.addEventListener("click", (e) => {
      const node = (e.target as HTMLElement).closest(".jen-tree-node") as HTMLElement;
      if (node) {
        const componentId = (node as any).dataset.componentId;
        if (componentId) {
          const component = this.componentTree.getComponentById(componentId);
          if (component) {
            this.selectComponent(component);
          }
        }
      }
    });

    // Hover to highlight DOM element
    tree.addEventListener("mouseover", (e) => {
      const node = (e.target as HTMLElement).closest(".jen-tree-node") as HTMLElement;
      if (node) {
        const componentId = (node as any).dataset.componentId;
        if (componentId) {
          const component = this.componentTree.getComponentById(componentId);
          if (component?.el) {
            component.el.classList.add("jen-devtools-highlight");
          }
        }
      }
    });

    tree.addEventListener("mouseout", (e) => {
      const node = (e.target as HTMLElement).closest(".jen-tree-node") as HTMLElement;
      if (node) {
        const componentId = (node as any).dataset.componentId;
        if (componentId) {
          const component = this.componentTree.getComponentById(componentId);
          if (component?.el) {
            component.el.classList.remove("jen-devtools-highlight");
          }
        }
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;
      if (e.key === "ArrowDown") {
        this.selectNextComponent();
      } else if (e.key === "ArrowUp") {
        this.selectPreviousComponent();
      } else if (e.key === "ArrowRight") {
        this.expandComponent();
      } else if (e.key === "ArrowLeft") {
        this.collapseComponent();
      } else if (e.key === "Enter") {
        this.toggleComponentExpanded();
      }
    });
  }

  private setupSearch() {
    if (!this.panel) return;

    const searchInput = this.panel.querySelector(
      ".jen-devtools-search"
    ) as HTMLInputElement;
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value;
      const results = this.searchManager.search(query);
      this.renderSearchResults(results);
    });
  }

  private selectTab(tabName: string) {
    if (!this.panel) return;

    // Update tab buttons
    const tabs = this.panel.querySelectorAll(".jen-devtools-tab");
    tabs.forEach((tab) => {
      const tabEl = tab as HTMLElement;
      tabEl.classList.toggle("active", (tabEl as any).dataset.tab === tabName);
    });

    // Update tab content
    const contents = this.panel.querySelectorAll(".jen-devtools-tab-content");
    contents.forEach((content) => {
      const contentEl = content as HTMLElement;
      contentEl.classList.toggle("active", (contentEl as any).dataset.tab === tabName);
    });

    this.config.collapsedTabs[tabName] = false;
    this.persistence.saveConfig(this.config);
  }

  private selectComponent(component: ComponentNode) {
    this.selectedComponent = component;
    this.renderInspector();
  }

  private selectNextComponent() {
    if (!this.selectedComponent) return;
    const next = this.componentTree.getNextComponent(this.selectedComponent);
    if (next) {
      this.selectComponent(next);
    }
  }

  private selectPreviousComponent() {
    if (!this.selectedComponent) return;
    const prev = this.componentTree.getPreviousComponent(this.selectedComponent);
    if (prev) {
      this.selectComponent(prev);
    }
  }

  private expandComponent() {
    if (!this.selectedComponent) return;
    this.selectedComponent.expanded = true;
    this.renderComponentTree();
  }

  private collapseComponent() {
    if (!this.selectedComponent) return;
    this.selectedComponent.expanded = false;
    this.renderComponentTree();
  }

  private toggleComponentExpanded() {
    if (!this.selectedComponent) return;
    this.selectedComponent.expanded = !this.selectedComponent.expanded;
    this.renderComponentTree();
  }

  private renderInspector() {
    if (!this.panel || !this.selectedComponent) return;

    const inspector = this.panel.querySelector(
      ".jen-devtools-inspector"
    ) as HTMLElement;
    if (!inspector) return;

    const component = this.selectedComponent;

    inspector.innerHTML = `
      <div class="jen-inspector-header">
        <h3>${component.name}</h3>
        <span class="jen-inspector-type">${component.type}</span>
      </div>

      <div class="jen-inspector-section">
        <h4>Props</h4>
        <div class="jen-inspector-props">
          ${this.renderPropsEditor(component.props)}
        </div>
      </div>

      <div class="jen-inspector-section">
        <h4>State</h4>
        <div class="jen-inspector-state">
          ${this.renderStateEditor(component.state)}
        </div>
      </div>

      <div class="jen-inspector-section">
        <h4>Hooks</h4>
        <div class="jen-inspector-hooks">
          ${this.renderHooks(component.hooks)}
        </div>
      </div>

      <div class="jen-inspector-section">
        <h4>Events</h4>
        <div class="jen-inspector-events">
          ${this.renderEvents(component.events)}
        </div>
      </div>
    `;
  }

  private renderPropsEditor(props: Record<string, any>) {
    return Object.entries(props)
      .map(
        ([key, value]) => `
      <div class="jen-prop-item">
        <span class="jen-prop-key">${key}</span>
        <input
          type="text"
          class="jen-prop-value"
          value="${this.serializeValue(value)}"
          data-prop="${key}"
          data-component="${this.selectedComponent?.id}"
        />
        <span class="jen-prop-type">${typeof value}</span>
      </div>
    `
      )
      .join("");
  }

  private renderStateEditor(state: Record<string, any>) {
    return Object.entries(state)
      .map(
        ([key, value]) => `
      <div class="jen-state-item">
        <span class="jen-state-key">${key}</span>
        <input
          type="text"
          class="jen-state-value"
          value="${this.serializeValue(value)}"
          data-state="${key}"
          data-component="${this.selectedComponent?.id}"
        />
        <span class="jen-state-type">${typeof value}</span>
      </div>
    `
      )
      .join("");
  }

  private renderHooks(hooks: any[]) {
    return hooks
      .map(
        (hook, i) => `
      <div class="jen-hook-item">
        <span class="jen-hook-index">[${i}]</span>
        <span class="jen-hook-type">${hook.type}</span>
        <span class="jen-hook-value">${this.serializeValue(hook.value)}</span>
      </div>
    `
      )
      .join("");
  }

  private renderEvents(events: string[]) {
    if (events.length === 0) {
      return "<p>No events</p>";
    }
    return events
      .map(
        (event) => `
      <div class="jen-event-item">
        <span class="jen-event-name">${event}</span>
      </div>
    `
      )
      .join("");
  }

  private renderComponentTree() {
    if (!this.panel) return;

    const treeContainer = this.panel.querySelector(
      ".jen-devtools-tree"
    ) as HTMLElement;
    if (!treeContainer) return;

    const tree = this.componentTree.getTree();
    treeContainer.innerHTML = this.renderTreeNodes(tree);
  }

  private renderTreeNodes(nodes: ComponentNode[]): string {
    return nodes
      .map((node) => {
        const children = node.children ? this.renderTreeNodes(node.children) : "";
        const isSelected = this.selectedComponent?.id === node.id;
        const icon = node.children && node.children.length > 0
          ? node.expanded
            ? "▼"
            : "▶"
          : "•";

        return `
          <div class="jen-tree-node ${isSelected ? "selected" : ""}" data-component-id="${node.id}">
            <div class="jen-tree-node-content">
              <span class="jen-tree-icon">${icon}</span>
              <span class="jen-tree-name">${node.name}</span>
            </div>
            ${node.expanded && children ? `<div class="jen-tree-children">${children}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  private renderSearchResults(results: ComponentNode[]) {
    if (!this.panel) return;

    const resultsContainer = this.panel.querySelector(
      ".jen-search-results"
    ) as HTMLElement;
    if (!resultsContainer) return;

    resultsContainer.innerHTML = results
      .map(
        (result) => `
      <div class="jen-search-result" data-component-id="${result.id}">
        <span>${result.name}</span>
      </div>
    `
      )
      .join("");
  }

  private serializeValue(value: any): string {
    if (value === null || value === undefined) {
      return String(value);
    }
    if (typeof value === "object") {
      return JSON.stringify(value).substring(0, 50);
    }
    return String(value);
  }

  private applyTheme() {
    if (!this.panel) return;
    this.panel.classList.toggle("dark-theme", this.theme === "dark");
    this.panel.classList.toggle("light-theme", this.theme === "light");
  }

  private cycleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    this.config.theme = this.theme;
    this.applyTheme();
    this.persistence.saveConfig(this.config);
  }

  private toggleMinimize() {
    this.config.minimized = !this.config.minimized;
    if (this.panel) {
      this.panel.classList.toggle("minimized", this.config.minimized);
    }
    this.persistence.saveConfig(this.config);
  }

  private export() {
    const state = {
      components: this.componentTree.getTree(),
      events: this.eventLogger.getLogs(),
      performance: this.performanceMonitor.getMetrics(),
    };

    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jen-devtools-export-${Date.now()}.json`;
    a.click();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (this.panel) {
      this.panel.classList.add("open");
    }
  }

  close() {
    this.isOpen = false;
    if (this.panel) {
      this.panel.classList.remove("open");
    }
  }

  /**
   * Register a component for inspection
   */
  registerComponent(
    id: string,
    name: string,
    el: HTMLElement,
    props: Record<string, any>,
    state?: Record<string, any>,
    hooks?: any[]
  ) {
    this.componentTree.addComponent({
      id,
      name,
      el,
      props,
      state: state || {},
      hooks: hooks || [],
      events: [],
      type: "component",
      children: [],
      expanded: false,
      parent: null,
    });

    this.eventBus.emit("component:registered", { id, name });
  }

  /**
   * Update component state
   */
  updateComponentState(componentId: string, state: Record<string, any>) {
    const component = this.componentTree.getComponentById(componentId);
    if (component) {
      component.state = { ...component.state, ...state };
      this.renderInspector();
      this.eventBus.emit("component:updated", { componentId, state });
    }
  }

  /**
   * Log an event
   */
  logEvent(componentId: string, eventName: string, data?: any) {
    this.eventLogger.log(componentId, eventName, data);
    this.eventBus.emit("event:logged", { componentId, eventName, data });
  }

  /**
   * Register a plugin
   */
  registerPlugin(name: string, factory: (devtools: DevTools) => any) {
    this.pluginSystem.register(name, factory);
  }

  /**
   * Get the plugin system
   */
  getPluginSystem(): PluginSystem {
    return this.pluginSystem;
  }

  /**
   * Get the event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Destroy DevTools and clean up
   */
  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    this.isOpen = false;
  }
}

/**
 * Global DevTools instance
 */
let globalDevTools: DevTools | null = null;

/**
 * Initialize DevTools in development mode
 */
export function initDevTools(config?: DevToolsConfig): DevTools {
  if (!globalDevTools) {
    globalDevTools = new DevTools({
      enabled: true,
      ...config,
    });
  }
  return globalDevTools;
}

/**
 * Get the global DevTools instance
 */
export function getDevTools(): DevTools | null {
  return globalDevTools;
}
