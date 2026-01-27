export type RenderMode = "ssr" | "ssg" | "isr" | "ppr";

export type FrameworkConfig = {
  siteDir: string;
  distDir: string;

  routes: {
    fileExtensions: string[];
    routeFilePattern: RegExp;
    enableIndexFallback: boolean;
  };

  rendering: {
    defaultMode: RenderMode;
    defaultRevalidateSeconds: number;
  };

  inject: {
    head: string[];
    bodyEnd: string[];
  };

  css: {
    globalScss: string;
    criticalBudget?: number;
    extractCritical?: boolean;
  };

  assets: {
    publicDir: string;
    cacheControl: string;
    hashLength?: number;
  };

  server: {
    port: number;
    hostname: string;
  };

  build?: {
    minifyHtml?: boolean;
    minifyCss?: boolean;
    minifyJs?: boolean;
    hashAssets?: boolean;
    generateManifest?: boolean;
    generateSitemap?: boolean;
    cacheDir?: string;
    incrementalBuild?: boolean;
    sourceMap?: boolean;
  };

  dev?: {
    enableSSR?: boolean;
    liveReload?: boolean;
    port?: number;
  };

  seo?: {
    generateRobotsTxt?: boolean;
    generateSitemap?: boolean;
    sitemapBaseUrl?: string;
  };
};
