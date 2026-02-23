/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevTools, initDevTools, getDevTools } from '../src/devtools/devtools.js';
import { ComponentTreeManager, type ComponentNode } from '../src/devtools/component-tree.js';
import { EventLogger } from '../src/devtools/event-logger.js';
import { PerformanceMonitor } from '../src/devtools/performance.js';
import { SearchManager } from '../src/devtools/search.js';
import { PersistenceManager } from '../src/devtools/persistence.js';
import { createEventBus } from '../src/devtools/event-bus.js';

describe('DevTools', () => {
  describe('ComponentTreeManager', () => {
    let manager: ComponentTreeManager;

    beforeEach(() => {
      const bus = createEventBus();
      manager = new ComponentTreeManager(bus);
    });

    it('should add and retrieve components', () => {
      const component: ComponentNode = {
        id: 'test-1',
        name: 'TestComponent',
        type: 'component',
        el: null,
        props: { foo: 'bar' },
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      manager.addComponent(component);
      const retrieved = manager.getComponentById('test-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('TestComponent');
    });

    it('should manage component hierarchy', () => {
      const parent: ComponentNode = {
        id: 'parent',
        name: 'Parent',
        type: 'component',
        el: null,
        props: {},
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      const child: ComponentNode = {
        id: 'child',
        name: 'Child',
        type: 'component',
        el: null,
        props: {},
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent,
        expanded: false,
      };

      parent.children.push(child);

      manager.addComponent(parent);
      manager.addComponent(child);

      const tree = manager.getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].name).toBe('Child');
    });

    it('should remove components', () => {
      const component: ComponentNode = {
        id: 'test-2',
        name: 'TestComponent',
        type: 'component',
        el: null,
        props: {},
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      manager.addComponent(component);
      expect(manager.getComponentById('test-2')).toBeDefined();

      manager.removeComponent('test-2');
      expect(manager.getComponentById('test-2')).toBeUndefined();
    });

    it('should navigate components with arrow keys', () => {
      const comp1: ComponentNode = {
        id: 'comp-1',
        name: 'Component1',
        type: 'component',
        el: null,
        props: {},
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      const comp2: ComponentNode = {
        id: 'comp-2',
        name: 'Component2',
        type: 'component',
        el: null,
        props: {},
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      manager.addComponent(comp1);
      manager.addComponent(comp2);

      const next = manager.getNextComponent(comp1);
      expect(next?.id).toBe('comp-2');

      const prev = manager.getPreviousComponent(comp2);
      expect(prev?.id).toBe('comp-1');
    });
  });

  describe('EventLogger', () => {
    let logger: EventLogger;

    beforeEach(() => {
      logger = new EventLogger();
    });

    it('should log events', () => {
      logger.log('component-1', 'click', { x: 100, y: 200 });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].source).toBe('component-1');
      expect(logs[0].type).toBe('click');
    });

    it('should filter logs by source', () => {
      logger.log('comp-1', 'click', {});
      logger.log('comp-2', 'hover', {});
      logger.log('comp-1', 'focus', {});

      const comp1Logs = logger.getLogsBySource('comp-1');
      expect(comp1Logs).toHaveLength(2);
    });

    it('should search logs', () => {
      logger.log('button', 'click', {});
      logger.log('input', 'change', {});
      logger.log('button', 'hover', {});

      const results = logger.search('button');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.source === 'button')).toBe(true);
    });

    it('should maintain max log limit', () => {
      // Log more than max (1000)
      for (let i = 0; i < 1100; i++) {
        logger.log('source', 'event', {});
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('should clear logs', () => {
      logger.log('source', 'event', {});
      expect(logger.getLogs().length).toBeGreaterThan(0);

      logger.clear();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should record FPS', () => {
      monitor.recordFPS(60);
      monitor.recordFPS(59);
      monitor.recordFPS(61);

      const metrics = monitor.getMetrics();
      expect(metrics.fps.length).toBeGreaterThan(0);
    });

    it('should record render time', () => {
      monitor.recordRenderTime(16.67);
      monitor.recordRenderTime(17.5);

      const metrics = monitor.getMetrics();
      expect(metrics.renderTime.length).toBeGreaterThan(0);
    });

    it('should calculate average FPS', () => {
      monitor.recordFPS(60);
      monitor.recordFPS(60);
      monitor.recordFPS(60);

      const avgFps = monitor.getAverageFPS();
      expect(avgFps).toBe(60);
    });

    it('should get last recorded values', () => {
      monitor.recordFPS(50);
      monitor.recordFPS(60);

      expect(monitor.getLastFPS()).toBe(60);
    });

    it('should reset metrics', () => {
      monitor.recordFPS(60);
      monitor.recordRenderTime(16.67);
      expect(monitor.getMetrics().fps.length).toBeGreaterThan(0);

      monitor.reset();
      expect(monitor.getMetrics().fps).toHaveLength(0);
    });
  });

  describe('SearchManager', () => {
    let manager: ComponentTreeManager;
    let search: SearchManager;

    beforeEach(() => {
      const bus = createEventBus();
      manager = new ComponentTreeManager(bus);
      search = new SearchManager(manager);

      const comp1: ComponentNode = {
        id: 'comp-1',
        name: 'Button',
        type: 'component',
        el: null,
        props: { label: 'Click me' },
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      const comp2: ComponentNode = {
        id: 'comp-2',
        name: 'Input',
        type: 'component',
        el: null,
        props: { placeholder: 'Type here', type: 'text' },
        state: {},
        hooks: [],
        events: [],
        children: [],
        parent: null,
        expanded: false,
      };

      manager.addComponent(comp1);
      manager.addComponent(comp2);
    });

    it('should search by component name', () => {
      const results = search.searchByName('Button');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('comp-1');
    });

    it('should search by prop value', () => {
      const results = search.searchByProp('placeholder', 'Type here');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('comp-2');
    });

    it('should global search', () => {
      const results = search.search('Button');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('PersistenceManager', () => {
    let manager: PersistenceManager;

    beforeEach(() => {
      manager = new PersistenceManager();
      manager.clearAll();
    });

    it('should save and load config', () => {
      const config = { theme: 'dark' as const, enabled: true };
      manager.saveConfig(config);

      const loaded = manager.loadConfig();
      expect(loaded.theme).toBe('dark');
      expect(loaded.enabled).toBe(true);
    });

    it('should save and load component state', () => {
      const state = { count: 5, text: 'hello' };
      manager.saveComponentState('comp-1', state);

      const loaded = manager.loadComponentState('comp-1');
      expect(loaded).toEqual(state);
    });

    it('should clear component state', () => {
      manager.saveComponentState('comp-1', { value: 1 });
      manager.clearComponentState('comp-1');

      const loaded = manager.loadComponentState('comp-1');
      expect(loaded).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Simulate localStorage.setItem throwing
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        manager.saveConfig({ enabled: true });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('Global DevTools Instance', () => {
    it('should initialize global instance', () => {
      const devtools = initDevTools({ enabled: false });
      expect(devtools).toBeDefined();
    });

    it('should retrieve global instance', () => {
      const instance = getDevTools();
      expect(instance).toBeDefined();
    });

    it('should only create one global instance', () => {
      const devtools1 = getDevTools();
      const devtools2 = getDevTools();
      expect(devtools1).toBe(devtools2);
    });
  });

  describe('EventBus', () => {
    it('should emit and receive events', () => {
      const bus = createEventBus();
      const callback = vi.fn();

      bus.on('test-event', callback);
      bus.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should unsubscribe from events', () => {
      const bus = createEventBus();
      const callback = vi.fn();

      bus.on('test-event', callback);
      bus.off('test-event', callback);
      bus.emit('test-event', {});

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const bus = createEventBus();
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      bus.on('test-event', callback1);
      bus.on('test-event', callback2);
      bus.emit('test-event', {});

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const bus = createEventBus();
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const goodCallback = vi.fn();

      bus.on('test-event', errorCallback);
      bus.on('test-event', goodCallback);

      expect(() => {
        bus.emit('test-event', {});
      }).not.toThrow();

      expect(goodCallback).toHaveBeenCalled();
    });
  });
});
