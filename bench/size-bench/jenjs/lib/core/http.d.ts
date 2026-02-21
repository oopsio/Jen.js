import type { IncomingMessage } from "node:http";
export declare function parseCookies(req: IncomingMessage): Record<string, string>;
export declare function headersToObject(headers: IncomingMessage["headers"]): Record<string, string>;
