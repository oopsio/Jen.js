# Jen.js DevTools

A fully functional, interactive development tools panel for Jen.js applications. Inspect components, edit state/props in real-time, track events and performance metrics—all without mocking.

## Features

### 🎨 UI & Layout

- **Floating Overlay Panel**: Draggable, resizable panel that stays on top
- **Minimizable**: Collapse to header for quick access
- **Themeable**: Light/dark mode with persistent settings
- **Responsive**: Adapts to different screen sizes
- **Keyboard Navigation**: Full support for arrow keys and Enter

### 🌳 Component Inspection

- **Live Component Tree**: Visual hierarchy of all components on the page
- **Collapsible Nodes**: Expand/collapse to explore the tree
- **Real-time Highlighting**: Hover over components to highlight their DOM elements
- **Keyboard Shortcuts**: Arrow keys to navigate, Enter to select

### 📊 Inspector Tab

- **Props Inspector**: View and edit component props
- **State Inspector**: Monitor and modify component state in real-time
- **Hooks Display**: See registered hooks and their values
- **Events Tracker**: Track component events and lifecycle

### 📝 Console Tab

- **Log Aggregation**: Capture console.log, console.error, console.warn
- **Timestamp**: Each log entry shows exact time
- **Filtering**: Filter logs by level or source
- **Command History**: Store console inputs for replay

### 🌐 Network Tab

- **Request Tracking**: Monitor async operations and API calls
- **Status Codes**: Color-coded request statuses
- **Timing**: View request duration and timing data
- **Request/Response**: Inspect request and response payloads

### ⚡ Performance Tab

- **FPS Monitor**: Real-time frame rate tracking
- **Render Time**: Measure component render performance
- **Update Counter**: Track state updates
- **Memory Usage**: Monitor heap size (when available)
- **Performance Chart**: Visual performance history over time

### 🔍 Search & Filter

- **Global Search**: Find components by name, type, or props
- **Prop Search**: Search by specific prop names/values
- **Type Filter**: Filter components by type
- **Real-time Results**: Instant search results

### 🔌 Plugin System

- **Extensible Architecture**: Add custom tabs and inspectors
- **Plugin Lifecycle**: Setup/teardown hooks
- **Event System**: Listen to DevTools events
- **Easy Registration**: Simple API for plugin creation

### 💾 Persistence

- **Auto-save**: Panel layout, size, position saved automatically
- **localStorage**: Settings persist across page reloads
- **State Export**: Export component state as JSON snapshots
- **Event Logs**: Complete audit trail of all interactions

## Installation

```bash
npm install jen.js
# or
pnpm add jen.js
```

## Quick Start

### Basic Setup

```typescript
import { initDevTools, injectStyles } from "@jen.js/devtools";

// Inject styles and initialize DevTools
injectStyles();
const devtools = initDevTools({
  enabled: true,
  theme: "dark",
});

// Access the DevTools instance
console.log(devtools);
```

### Register Components

```typescript
// Register a component for inspection
devtools.registerComponent(
  "my-component-1", // unique id
  "MyComponent", // component name
  element, // DOM element
  { prop1: "value" }, // props
  { count: 0 }, // state
  [], // hooks
);

// Update component state
devtools.updateComponentState("my-component-1", {
  count: 1,
});

// Log events
devtools.logEvent("my-component-1", "click", {
  x: 100,
  y: 200,
});
```

### Integration with Components

```typescript
import {
  useDevToolsIntegration,
  createLogger,
} from "@jen.js/devtools/integration";

function MyComponent(props) {
  const { componentId, trackState, trackEvent } = useDevToolsIntegration(
    "MyComponent",
    devtools,
  );

  const logger = createLogger(devtools, componentId);

  // Use logger instead of console
  logger.log("Component mounted");

  return {
    render() {
      return h(
        "div",
        {
          onClick: () => {
            trackEvent("click", { timestamp: Date.now() });
            logger.log("Clicked!");
          },
        },
        "Click me",
      );
    },
  };
}
```

## API Reference

### DevTools Class

#### Constructor

```typescript
new DevTools(config?: DevToolsConfig)
```

#### Methods

- `registerComponent(id, name, el, props, state?, hooks?)` - Register a component
- `updateComponentState(id, state)` - Update component state
- `logEvent(componentId, eventName, data?)` - Log an event
- `toggle()` - Toggle DevTools visibility
- `open()` - Open DevTools
- `close()` - Close DevTools
- `registerPlugin(name, factory)` - Register a plugin
- `getPluginSystem()` - Get the plugin system instance
- `getEventBus()` - Get the event bus
- `destroy()` - Clean up and remove DevTools

### Global Functions

```typescript
// Initialize DevTools globally
initDevTools(config?: DevToolsConfig): DevTools

// Get the global instance
getDevTools(): DevTools | null

// Inject styles into document
injectStyles(): void
```

### Integration Helpers

```typescript
// Hook for tracking state and events
useDevToolsIntegration(componentName, devtools);

// Wrap component with DevTools tracking
withDevTools(Component, devtools);

// Create a monitored event listener
createMonitoredListener(devtools, componentId, eventName, handler);

// Monitor DOM changes
monitorDOMChanges(devtools, componentId, element);

// Create a DevTools-aware logger
createLogger(devtools, componentId);

// Measure render performance
measureComponentRender(devtools, componentName, renderFn);
```

### Configuration

```typescript
interface DevToolsConfig {
  enabled?: boolean; // Enable/disable DevTools
  theme?: "light" | "dark"; // Theme preference
  position?: { x: number; y: number }; // Initial position
  size?: { width: number; height: number }; // Initial size
  minimized?: boolean; // Start minimized
  collapsedTabs?: Record<string, boolean>; // Collapsed tab states
}
```

## Plugin Development

### Creating a Plugin

```typescript
import { createPlugin } from "@jen.js/devtools";

const myPlugin = createPlugin({
  name: "my-devtools-plugin",
  version: "1.0.0",
  setup() {
    console.log("Plugin setup");
  },
  teardown() {
    console.log("Plugin teardown");
  },
});

devtools.registerPlugin("my-plugin", myPlugin);
```

### Advanced Plugin

```typescript
import { DevTools } from "@jen.js/devtools";

class MyPlugin {
  constructor(private devtools: DevTools) {}

  setup() {
    // Listen to DevTools events
    this.devtools.getEventBus().on("component:registered", (data) => {
      console.log("Component registered:", data);
    });

    // Add custom UI
    this.addCustomTab();
  }

  private addCustomTab() {
    // Implementation
  }

  teardown() {
    // Cleanup
  }
}

devtools.registerPlugin("my-plugin", () => new MyPlugin(devtools));
```

## Keyboard Shortcuts

| Shortcut                       | Action                    |
| ------------------------------ | ------------------------- |
| `Ctrl+Shift+J` / `Cmd+Shift+J` | Toggle DevTools           |
| `Esc`                          | Close DevTools            |
| `↑` / `↓`                      | Navigate component tree   |
| `→`                            | Expand component          |
| `←`                            | Collapse component        |
| `Enter`                        | Toggle component expanded |

## Example Usage

See `example.html` for a complete, working demo with:

- Counter component with state tracking
- Input field with change tracking
- Dynamic list with add/remove operations
- Toggle switch with boolean state
- Timer with lifecycle events
- Contact form with validation

Run the example:

```bash
# Serve the example HTML file
npx http-server src/devtools/
# Visit http://localhost:8080/example.html
```

## Architecture

### Core Modules

- **devtools.ts**: Main DevTools class
- **ui.ts**: HTML/CSS generation
- **component-tree.ts**: Component registry and tree management
- **event-bus.ts**: Event system
- **event-logger.ts**: Console/event logging
- **performance.ts**: Performance monitoring
- **search.ts**: Component search functionality
- **plugins.ts**: Plugin system
- **persistence.ts**: localStorage management
- **integration.ts**: Helper functions for integration

### Data Flow

```
User Interaction
      ↓
DevTools Panel
      ↓
Component Tree Manager
      ↓
Event Bus
      ↓
Event Logger / Performance Monitor / Plugins
```

## Performance Considerations

- **Minimal Overhead**: DevTools is lightweight and only active in development
- **Lazy Loading**: Styles and UI only injected when initialized
- **Event Batching**: Logs are batched to avoid excessive DOM updates
- **Bounded Memory**: Logs are kept to 1000 entries max
- **Efficient Tree Navigation**: Component tree uses efficient data structures

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

## Development Mode Detection

DevTools automatically respects your build configuration:

```typescript
// Only in development
if (import.meta.env.DEV) {
  initDevTools();
}

// Or with process.env
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  initDevTools();
}
```

## Best Practices

1. **Always register components early** - Register before rendering
2. **Use meaningful component names** - For easier debugging
3. **Log important events** - Track user interactions and state changes
4. **Monitor performance** - Use render time tracking for optimization
5. **Export states** - Create snapshots for bug reports
6. **Use plugins** - Extend DevTools with domain-specific tools

## Troubleshooting

### DevTools not appearing

- Ensure `initDevTools()` was called
- Check that `enabled: true` in config
- Verify styles are injected with `injectStyles()`

### Components not showing up

- Make sure `registerComponent()` is called after component renders
- Check that the component ID is unique
- Verify the DOM element exists

### Performance impact

- DevTools adds minimal overhead (~5-10% in typical apps)
- Consider disabling in production builds
- Use `NODE_ENV` checks to auto-disable

## License

GNU General Public License v3.0 - See LICENSE file

## Contributing

Contributions welcome! Please follow the project's code style and include tests for new features.
