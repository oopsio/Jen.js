export type RuntimeEnvironment = 'bun' | 'deno' | 'node' | 'unknown';

export interface RouteDefinition {
  filePathTsx?: string; // Might be undefined if they only made a JSX file
  filePathJsx?: string; // Might be undefined if they only made a TSX file
  urlPath: string;
  isDynamic: boolean;
  dynamicParamName?: string;
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
    cors?: boolean | Record<string, any>;
    bodyParser?: boolean | Record<string, any>;
    errorBoundary?: boolean;
    requestLogger?: boolean;
    custom?: Array<{
      name: string;
      handler: (context: any, next: any) => Promise<void>;
      priority?: number;
    }>;
  };
  isr?: {
    enabled: boolean;
    cacheDir?: string;
    maxRetries?: number;
    retryDelay?: number;
    globalRevalidate?: number; // global fallback in seconds
  };
}
