import type { RenderMode } from "./config.js";

export type RouteModule = {
  mode?: RenderMode;
  revalidateSeconds?: number;

  loader?: (ctx: LoaderContext) => Promise<any> | any;

  Head?: (props: any) => any;
  default: (props: any) => any;
};

export type LoaderContext = {
  url: URL;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
};
  
