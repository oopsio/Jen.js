export interface DevServerOptions {
    port?: number;
    hostname?: string;
    root?: string;
}
export declare function startDevServer(opts?: DevServerOptions): Promise<import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>>;
