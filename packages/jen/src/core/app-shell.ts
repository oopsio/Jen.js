import { ComponentType } from 'preact';
import path from 'node:path';
import fs from 'node:fs';
import type { ViteDevServer } from 'vite';
import type { ErrorFallbackProps } from './error-boundary';

/**
 * AppComponent receives any props the page passes + Component (the page) + pageProps
 */
export interface AppComponentProps {
  Component: ComponentType;
  pageProps: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * DocumentComponent wraps the entire HTML structure for custom head/body handling
 */
export interface DocumentComponentProps {
  head?: string;
  body?: string;
  initialProps?: Record<string, unknown>;
}

/**
 * App Shell Manager: Scans and loads _app.tsx, _document.tsx, and _error.tsx if present
 */
export class AppShellManager {
  private static appComponent: ComponentType<AppComponentProps> | null = null;
  private static documentComponent: ComponentType<DocumentComponentProps> | null = null;
  private static errorComponent: ComponentType<ErrorFallbackProps> | null = null;
  private static isInitialized = false;

  /**
   * Initialize by scanning the pages root for _app.tsx, _document.tsx, and _error.tsx
   */
  public static async initialize(vite: ViteDevServer): Promise<void> {
    if (this.isInitialized) return;

    const pagesRoot = path.resolve(process.cwd(), 'pages');

    // Try to load _app.tsx
    const appPath = path.join(pagesRoot, '_app.tsx');
    if (fs.existsSync(appPath)) {
      try {
        const appModule = await vite.ssrLoadModule(appPath);
        this.appComponent = appModule.default;
      } catch {
        // _app.tsx failed to load
      }
    }

    // Try to load _document.tsx
    const docPath = path.join(pagesRoot, '_document.tsx');
    if (fs.existsSync(docPath)) {
      try {
        const docModule = await vite.ssrLoadModule(docPath);
        this.documentComponent = docModule.default;
      } catch {
        // _document.tsx failed to load
      }
    }

    // Try to load _error.tsx
    const errorPath = path.join(pagesRoot, '_error.tsx');
    if (fs.existsSync(errorPath)) {
      try {
        const errorModule = await vite.ssrLoadModule(errorPath);
        this.errorComponent = errorModule.default;
      } catch {
        // _error.tsx failed to load
      }
    }

    this.isInitialized = true;
  }

  /**
   * Get the App Component if it exists
   */
  public static getAppComponent(): ComponentType<AppComponentProps> | null {
    return this.appComponent;
  }

  /**
   * Get the Document Component if it exists
   */
  public static getDocumentComponent(): ComponentType<DocumentComponentProps> | null {
    return this.documentComponent;
  }

  /**
   * Get the Error Component if it exists
   */
  public static getErrorComponent(): ComponentType<ErrorFallbackProps> | null {
    return this.errorComponent;
  }

  /**
   * Reset for hot module reloading during development
   */
  public static reset(): void {
    this.appComponent = null;
    this.documentComponent = null;
    this.errorComponent = null;
    this.isInitialized = false;
  }
}
