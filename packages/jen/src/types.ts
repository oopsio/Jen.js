export type RuntimeEnvironment = 'bun' | 'deno' | 'node' | 'unknown';

export interface RouteLayout {
  tsx?: string;
  jsx?: string;
}

export interface RouteDefinition {
  filePathTsx?: string; // Might be undefined if they only made a JSX file
  filePathJsx?: string; // Might be undefined if they only made a TSX file
  layouts?: RouteLayout[]; // Nested layout hierarchy
  urlPath: string;
  isDynamic: boolean;
  dynamicParamName?: string;
}

export interface Metadata {
  title?: string;
  description?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    site?: string;
    creator?: string;
  };
  robots?: string;
  [key: string]: unknown;
}

export interface RenderContext {
  url: string;
  params: Record<string, string>;
  filePath: string;
}

export type RequestHandler = (
  request: Request,
  context: RenderContext,
) => Promise<Response> | Response;

export interface JenConfig {
  port: number;
  buildDirectory: string;
  name?: string;
  middleware?: {
    enabled?: boolean;
    cors?: boolean | Record<string, unknown>;
    bodyParser?: boolean | Record<string, unknown>;
    errorBoundary?: boolean;
    requestLogger?: boolean;
    custom?: Array<{
      name: string;
      handler: (context: unknown, next: () => Promise<void>) => Promise<void>;
      priority?: number;
    }>;
  };
  isr?: {
    enabled?: boolean;
    cacheDir?: string;
    maxRetries?: number;
    retryDelay?: number;
    globalRevalidate?: number; // global fallback in seconds
  };
  i18n?: {
    locales: string[];
    defaultLocale: string;
  };
  zone?: {
    basePath?: string;
    assetPrefix?: string;
  };
  csr?: {
    enabled?: boolean;
    loadingIndicator?: string;
  };
  ppr?: {
    enabled?: boolean;
  };
  requireDangerouslySetScripts?: boolean;
}
