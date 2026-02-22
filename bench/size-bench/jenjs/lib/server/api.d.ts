import type { IncomingMessage, ServerResponse } from "node:http";
export declare function tryHandleApiRoute(opts: {
  req: IncomingMessage;
  res: ServerResponse;
  siteDir: string;
}): Promise<boolean>;
