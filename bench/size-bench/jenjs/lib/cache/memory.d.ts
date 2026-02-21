export declare class MemoryCache {
    private store;
    set(key: string, value: any, ttlMs?: number): void;
    get(key: string): any;
    delete(key: string): void;
}
