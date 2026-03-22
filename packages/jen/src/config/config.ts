import { JenConfig } from '../types';

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
};

export function updateRuntimeConfig(userSettings: Partial<JenConfig>): void {
  // Merge middleware config properly
  if (userSettings.middleware) {
    RuntimeConfig.middleware = { ...RuntimeConfig.middleware, ...userSettings.middleware };
    delete userSettings.middleware;
  }
  // Merge ISR config properly
  if (userSettings.isr) {
    RuntimeConfig.isr = { ...RuntimeConfig.isr, ...userSettings.isr };
    delete userSettings.isr;
  }
  Object.assign(RuntimeConfig, userSettings);
}
