import { describe, it, expect, beforeEach, mock } from 'bun:test';

const mockFiles = new Set<string>();

// Mock node:fs with a fallback to the original implementation
mock.module('node:fs', () => {
  const originalFs = require('node:fs');
  return {
    ...originalFs,
    default: {
      ...originalFs,
      existsSync: (path: string) => {
        if (Array.from(mockFiles).some(f => path.endsWith(f))) return true;
        return originalFs.existsSync(path);
      },
    },
    existsSync: (path: string) => {
      if (Array.from(mockFiles).some(f => path.endsWith(f))) return true;
      return originalFs.existsSync(path);
    },
  };
});

import { AppShellManager } from '../app-shell.js';

describe('AppShellManager', () => {
  beforeEach(() => {
    AppShellManager.reset();
    mockFiles.clear();
  });

  it('should initialize with null components when none exist', async () => {
    // No files added to mockFiles, so existsSync will return false for these non-existent paths
    // Create a mock Vite server that throws on module loads
    const mockVite = {
      ssrLoadModule: async () => {
        throw new Error('Module not found');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);

    expect(AppShellManager.getAppComponent()).toBeNull();
    expect(AppShellManager.getDocumentComponent()).toBeNull();
  });

  it('should load app component if it exists', async () => {
    mockFiles.add('_app.tsx');
    const mockAppComponent = () => 'MockApp';
    const mockVite = {
      ssrLoadModule: async (path: string) => {
        if (path.includes('_app.tsx')) {
          return { default: mockAppComponent };
        }
        throw new Error('Module not found');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);

    expect(AppShellManager.getAppComponent()).toBe(mockAppComponent);
    expect(AppShellManager.getDocumentComponent()).toBeNull();
  });

  it('should load document component if it exists', async () => {
    mockFiles.add('_document.tsx');
    const mockDocComponent = () => 'MockDoc';
    const mockVite = {
      ssrLoadModule: async (path: string) => {
        if (path.includes('_document.tsx')) {
          return { default: mockDocComponent };
        }
        throw new Error('Module not found');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);

    expect(AppShellManager.getAppComponent()).toBeNull();
    expect(AppShellManager.getDocumentComponent()).toBe(mockDocComponent);
  });

  it('should only initialize once', async () => {
    mockFiles.add('_app.tsx');
    mockFiles.add('_document.tsx');
    mockFiles.add('_error.tsx');
    let callCount = 0;
    const mockVite = {
      ssrLoadModule: async () => {
        callCount++;
        throw new Error('Module not found');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);

    // Should only call ssrLoadModule 3 times (once for _app.tsx, _document.tsx, _error.tsx)
    expect(callCount).toBe(3);
  });

  it('should reset state correctly', async () => {
    mockFiles.add('_app.tsx');
    const mockApp = () => 'MockApp';
    const mockVite = {
      ssrLoadModule: async (path: string) => {
        if (path.includes('_app.tsx')) {
          return { default: mockApp };
        }
        throw new Error('Module not found');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await AppShellManager.initialize(mockVite as any);
    expect(AppShellManager.getAppComponent()).toBe(mockApp);

    AppShellManager.reset();
    expect(AppShellManager.getAppComponent()).toBeNull();
  });
});
