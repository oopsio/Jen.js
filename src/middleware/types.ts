import type { IncomingMessage, ServerResponse } from "node:http";

export type MiddlewareContext = {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
};

export type MiddlewareNext = () => Promise<void>;

export type Middleware = (ctx: MiddlewareContext, next: MiddlewareNext) => Promise<void> | void;
