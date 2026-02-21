import type { IncomingMessage, ServerResponse } from "node:http";
import type { FrameworkConfig } from "../core/config.js";
type AppMode = "dev" | "prod";
export declare function createApp(opts: {
    config: FrameworkConfig;
    mode: AppMode;
}): Promise<{
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
}>;
export {};
