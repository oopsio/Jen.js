import fs from 'node:fs';
import path from 'node:path';
import { RouteDefinition } from '../types.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m', // Green
  yellow: '\x1b[33m', // Yellow
  blue: '\x1b[34m', // Blue
  red: '\x1b[31m', // Red
  magenta: '\x1b[35m', // Magenta
  error: '\x1b[1;31m',
};

/**
 * Scans the filesystem for route definitions based on file paths.
 * Automatically detects dynamic parameters in folder names (e.g. `[$id]`).
 */
export class RouteScanner {
  /** The absolute path of the directory to scan (usually `<root>/pages`) */
  private readonly pagesDirectory: string;

  /**
   * Initializes the route scanner.
   * @param baseDirectory The root directory to start scanning from (defaults to CWD)
   */
  constructor(baseDirectory: string = process.cwd()) {
    this.pagesDirectory = path
      .resolve(baseDirectory, 'pages')
      .replace(/\\/g, '/');
  }

  /**
   * Recursively scans for pages and builds a list of RouteDefinitions.
   * @returns An array of route configurations discovered from the filesystem
   */
  public scanPages(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    this.walkAndScan(this.pagesDirectory, routes);
    return routes;
  }

  /**
   * Scans for a middleware file in the root directory.
   * @returns The path to the middleware file if found, otherwise undefined
   */
  public scanMiddleware(): string | undefined {
    const rootDir = path.dirname(this.pagesDirectory);
    const middlewareFiles = [
      'middleware.ts',
      'middleware.js',
      'middleware.tsx',
      'middleware.jsx',
    ];

    for (const file of middlewareFiles) {
      const fullPath = path.join(rootDir, file).replace(/\\/g, '/');
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    return undefined;
  }

  private walkAndScan(
    directory: string,
    routes: RouteDefinition[],
    currentLayouts: { tsx?: string; jsx?: string }[] = [],
  ): void {
    if (!fs.existsSync(directory)) return;

    const items = fs.readdirSync(directory);

    const hasLayoutTsx = items.includes('layout.tsx');
    const hasLayoutJsx = items.includes('layout.jsx');

    const layouts = [...currentLayouts];
    if (hasLayoutTsx || hasLayoutJsx) {
      layouts.push({
        tsx: hasLayoutTsx
          ? path.join(directory, 'layout.tsx').replace(/\\/g, '/')
          : undefined,
        jsx: hasLayoutJsx
          ? path.join(directory, 'layout.jsx').replace(/\\/g, '/')
          : undefined,
      });
    }

    const hasTsx = items.includes('app.tsx');
    const hasJsx = items.includes('app.jsx');

    if (hasTsx || hasJsx) {
      routes.push(this.createRoute(directory, hasTsx, hasJsx, layouts));
    }

    for (const item of items) {
      const fullPath = path.join(directory, item).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.walkAndScan(fullPath, routes, layouts);
      }
    }
  }

  private createRoute(
    dirPath: string,
    hasTsx: boolean,
    hasJsx: boolean,
    layouts: { tsx?: string; jsx?: string }[] = [],
  ): RouteDefinition {
    let relative = dirPath.split('/pages')[1] || '';
    if (relative === '') relative = '/';

    const dynamicRegex = /\[\$(.*?)\]/g;
    const isDynamic = dynamicRegex.test(relative);
    let dynamicParamName: string | undefined;

    const urlPath = relative.replace(dynamicRegex, (_, name) => {
      dynamicParamName = name;
      return `:${name}`;
    });

    const finalizedPath = urlPath === '/' ? '/' : urlPath.replace(/\/$/, '');

    const filePathTsx = hasTsx
      ? path.join(dirPath, 'app.tsx').replace(/\\/g, '/')
      : undefined;
    const filePathJsx = hasJsx
      ? path.join(dirPath, 'app.jsx').replace(/\\/g, '/')
      : undefined;

    console.log(
      `${colors.green}Found${colors.reset} ${finalizedPath} (TSX: ${hasTsx}, JSX: ${hasJsx})`,
    );

    return {
      filePathTsx,
      filePathJsx,
      layouts,
      urlPath: finalizedPath,
      isDynamic,
      dynamicParamName,
    };
  }
}
