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
  };

  assets: {
    publicDir: string;
    cacheControl: string;
  };

  server: {
    port: number;
    hostname: string;
  };
};
