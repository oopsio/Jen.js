import fs from 'node:fs';
import path from 'node:path';
import { RouteDefinition } from '../types';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m', // Green
  yellow: '\x1b[33m', // Yellow
  blue: '\x1b[34m', // Blue
  red: '\x1b[31m', // Red
  magenta: '\x1b[35m', // Magenta
  error: '\x1b[1;31m',
};

export class RouteScanner {
  private readonly pagesDirectory: string;

  constructor(baseDirectory: string = process.cwd()) {
    this.pagesDirectory = path
      .resolve(baseDirectory, 'pages')
      .replace(/\\/g, '/');
  }

  public scanPages(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    this.walkAndScan(this.pagesDirectory, routes);
    return routes;
  }

  private walkAndScan(directory: string, routes: RouteDefinition[]): void {
    if (!fs.existsSync(directory)) return;

    const items = fs.readdirSync(directory);

    const hasTsx = items.includes('app.tsx');
    const hasJsx = items.includes('app.jsx');

    if (hasTsx || hasJsx) {
      routes.push(this.createRoute(directory, hasTsx, hasJsx));
    }

    for (const item of items) {
      const fullPath = path.join(directory, item).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.walkAndScan(fullPath, routes);
      }
    }
  }

  private createRoute(
    dirPath: string,
    hasTsx: boolean,
    hasJsx: boolean,
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
      urlPath: finalizedPath,
      isDynamic,
      dynamicParamName,
    };
  }
}
