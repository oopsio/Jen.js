/**
 * CORS middleware with security defaults
 * Prevents insecure origin sharing with credentials
 */
interface CORSOptions {
    origin?: string | string[] | ((origin: string) => boolean) | "*";
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
}
export declare function cors(options?: CORSOptions): (ctx: any, next: () => Promise<void>) => Promise<void>;
export {};
