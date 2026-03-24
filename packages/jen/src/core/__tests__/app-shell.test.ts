import { describe, it, expect, beforeEach } from 'bun:test';
import { AppShellManager } from '../app-shell';

describe('AppShellManager', () => {
  beforeEach(() => {
    AppShellManager.reset();
  });

  it('should initialize with null components when none exist', async () => {
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
