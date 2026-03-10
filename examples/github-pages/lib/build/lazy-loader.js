/**
 * Lazy-loading manager for dynamic imports
 *
 * Detects and manages lazy-loaded modules:
 * - Identifies dynamic imports and code-split boundaries
 * - Generates lazy-loading metadata
 * - Creates runtime helpers for loading
 * - Implements prefetching/preloading strategies
 */
export class LazyLoader {
    modules = new Map();
    manifest;
    constructor(strategy = "lazy") {
        this.manifest = {
            modules: [],
            loadingStrategy: strategy,
            prefetch: strategy !== "eager",
            preload: strategy === "progressive",
        };
    }
    /**
     * Register a lazy-loaded module
     *
     * @example
     * ```typescript
     * lazyLoader.register({
     *   id: "dashboard",
     *   name: "Dashboard",
     *   path: "src/pages/dashboard.tsx",
     *   chunkName: "dashboard",
     *   condition: "route === 'dashboard'"
     * });
     * ```
     */
    register(module) {
        this.modules.set(module.id, module);
        this.manifest.modules.push(module);
    }
    /**
     * Detect lazy-loaded modules from source code
     *
     * Patterns detected:
     * - import() dynamic imports
     * - React.lazy() components
     * - Preact lazy() components
     * - @lazy-load comments
     */
    detectFromSource(source) {
        const detected = [];
        const patterns = {
            // import("./path") or import('./path')
            dynamicImport: /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // @lazy-load:"name"
            lazyComment: /@lazy-load:\s*"([^"]+)"/g,
            // React.lazy(() => import(...))
            reactLazy: /React\.lazy\s*\(\s*\(\)\s*=>\s*import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
        };
        // Detect dynamic imports
        let match;
        const importRegex = patterns.dynamicImport;
        while ((match = importRegex.exec(source)) !== null) {
            const path = match[1];
            detected.push({
                id: path.replace(/[./]/g, "-"),
                name: path.split("/").pop() || "unknown",
                path,
                chunkName: path.split("/").pop()?.replace(/\.[jt]sx?$/, "") || "chunk",
            });
        }
        // Detect lazy-load comments
        const commentRegex = patterns.lazyComment;
        while ((match = commentRegex.exec(source)) !== null) {
            const name = match[1];
            detected.push({
                id: name,
                name,
                path: name,
                chunkName: name,
            });
        }
        return detected;
    }
    /**
     * Generate runtime lazy-loading helper code
     */
    generateRuntimeHelper() {
        return `
/**
 * Auto-generated lazy-loading runtime helper
 * Manages dynamic imports with caching and error handling
 */

// Cache for loaded modules
const lazyCache = new Map();

/**
 * Load a lazy module by ID
 * Returns cached module if already loaded
 * Implements exponential backoff for failed loads
 */
export async function loadLazy(moduleId, moduleSpec) {
  if (lazyCache.has(moduleId)) {
    return lazyCache.get(moduleId);
  }

  let retries = 0;
  const maxRetries = 3;
  let lastError;

  while (retries < maxRetries) {
    try {
      const module = await import(moduleSpec);
      lazyCache.set(moduleId, module);
      return module;
    } catch (err) {
      lastError = err;
      retries++;
      if (retries < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, retries - 1)));
      }
    }
  }

  console.error(\`Failed to load module \${moduleId}:\`, lastError);
  throw lastError;
}

/**
 * Prefetch a lazy module
 * Useful for anticipated navigation or user interactions
 */
export function prefetchLazy(moduleId, moduleSpec) {
  if (typeof window === 'undefined') return; // Server-side, skip
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = moduleSpec;
  document.head.appendChild(link);
  
  // Also start loading in background
  loadLazy(moduleId, moduleSpec).catch(err => {
    console.warn(\`Prefetch for \${moduleId} failed:\`, err);
  });
}

/**
 * Preload a lazy module immediately
 * Used for critical lazy modules needed soon
 */
export function preloadLazy(moduleId, moduleSpec) {
  if (typeof window === 'undefined') return; // Server-side, skip
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = moduleSpec;
  document.head.appendChild(link);
  
  return loadLazy(moduleId, moduleSpec);
}

/**
 * Get lazy loading manifest
 */
export function getLazyManifest() {
  return ${JSON.stringify(this.manifest, null, 2)};
}
`;
    }
    /**
     * Generate lazy-loading manifest JSON
     */
    getManifest() {
        return {
            ...this.manifest,
            modules: Array.from(this.modules.values()),
        };
    }
    /**
     * Generate HTML script tags for lazy-loaded modules
     */
    generateLazyScriptTags() {
        let html = `<!-- Lazy-loaded module hints -->\n`;
        for (const module of this.modules.values()) {
            if (this.manifest.prefetch) {
                html += `<link rel="prefetch" as="script" href="/${module.chunkName}.js">\n`;
            }
            if (this.manifest.preload) {
                html += `<link rel="preload" as="script" href="/${module.chunkName}.js">\n`;
            }
        }
        return html;
    }
    /**
     * Generate Intersection Observer helper for visible-load pattern
     *
     * Lazy-loads components when they become visible in viewport
     * Useful for components below the fold
     */
    generateVisibleLoadHelper() {
        return `
/**
 * Load component when element becomes visible
 * Useful for below-the-fold content
 */
export function loadWhenVisible(elementId, moduleId, moduleSpec) {
  if (typeof window === 'undefined') return;
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: load immediately if IntersectionObserver not available
    return loadLazy(moduleId, moduleSpec);
  }

  const element = document.getElementById(elementId);
  if (!element) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        loadLazy(moduleId, moduleSpec);
      }
    }
  });

  observer.observe(element);
}

/**
 * Load component on user interaction
 * Examples: hover, focus, click
 */
export function loadOnInteraction(elementId, moduleId, moduleSpec, events = ['mouseover', 'focus', 'click']) {
  if (typeof window === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (!element) return;

  const listener = () => {
    for (const event of events) {
      element.removeEventListener(event, listener);
    }
    loadLazy(moduleId, moduleSpec);
  };

  for (const event of events) {
    element.addEventListener(event, listener, { once: true });
  }
}
`;
    }
    /**
     * Generate loading state component for Preact
     */
    generateLoadingComponent() {
        return `
/**
 * Loading component for lazy-loaded modules
 * Shows while module is loading
 */
import { h } from 'preact';

export function LazyLoading() {
  return h('div', { class: 'lazy-loading' },
    h('div', { class: 'spinner' }),
    h('p', null, 'Loading...')
  );
}

export function LazyError({ error, retry }) {
  return h('div', { class: 'lazy-error' },
    h('p', null, 'Failed to load component'),
    h('pre', null, error?.message),
    h('button', { onClick: retry }, 'Retry')
  );
}

export function withLazyFallback(Component, LoadingComponent = LazyLoading) {
  return function LazyComponent(props) {
    return h('ErrorBoundary', null,
      h('Suspense', { fallback: h(LoadingComponent) },
        h(Component, props)
      )
    );
  };
}
`;
    }
    /**
     * Generate configuration report
     */
    generateReport() {
        let report = "# Lazy-Loading Report\n\n";
        report += "## Configuration\n";
        report += `- Strategy: ${this.manifest.loadingStrategy}\n`;
        report += `- Prefetch: ${this.manifest.prefetch}\n`;
        report += `- Preload: ${this.manifest.preload}\n`;
        report += `- Total modules: ${this.modules.size}\n\n`;
        if (this.modules.size > 0) {
            report += "## Modules\n";
            for (const module of this.modules.values()) {
                report += `- ${module.name} (${module.chunkName})\n`;
                if (module.condition) {
                    report += `  Condition: ${module.condition}\n`;
                }
            }
        }
        return report;
    }
}
/**
 * Helper: Create lazy loader from config
 */
export function createLazyLoader(strategy = "lazy") {
    return new LazyLoader(strategy);
}
