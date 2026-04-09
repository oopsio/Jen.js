import { JenConfig } from '../types.js';

/**
 * Global parsed runtime configuration object for the Jen.js framework.
 * Holds defaults until overridden by a loaded `jen.config.ts`.
 */
export const RuntimeConfig: JenConfig = {
  port: 3000,
  buildDirectory: 'dist/static',
  name: 'Jen.js App',
  middleware: {
    enabled: true,
    cors: false,
    bodyParser: false,
    errorBoundary: true,
    requestLogger: true,
    custom: [],
  },
  isr: {
    enabled: false, // Disabled by default
    cacheDir: '.cache/isr',
    maxRetries: 3,
    retryDelay: 1000,
    globalRevalidate: undefined,
  },
  csr: {
    enabled: false,
    loadingIndicator: '',
  },
  ppr: {
    enabled: false,
  },
  requireDangerouslySetScripts: true,
};

/**
 * Merges partial user-provided settings securely into the global runtime configuration.
 * Distinctly handles nested config objects like `middleware` and `isr` to prevent overwriting.
 *
 * @param userSettings A partial configuration provided by the developer
 */
export function updateRuntimeConfig(userSettings: Partial<JenConfig>): void {
  // Merge middleware config properly
  if (userSettings.middleware) {
    RuntimeConfig.middleware = {
      ...RuntimeConfig.middleware,
      ...userSettings.middleware,
    };
    delete userSettings.middleware;
  }
  // Merge ISR config properly
  if (userSettings.isr) {
    RuntimeConfig.isr = { ...RuntimeConfig.isr, ...userSettings.isr };
    delete userSettings.isr;
  }
  // Merge CSR config properly
  if (userSettings.csr) {
    RuntimeConfig.csr = { ...RuntimeConfig.csr, ...userSettings.csr };
    delete userSettings.csr;
  }
  // Merge PPR config properly
  if (userSettings.ppr) {
    RuntimeConfig.ppr = { ...RuntimeConfig.ppr, ...userSettings.ppr };
    delete userSettings.ppr;
  }
  Object.assign(RuntimeConfig, userSettings);
}

/**
 * Type-safe configuration helper for Jen.js.
 * @param config The configuration object
 */
export function defineConfig(config: JenConfig): JenConfig {
  return config;
}
