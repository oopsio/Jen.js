export declare class RedisCache {
    connect(): Promise<void>;
    set(key: string, value: any, ttlSec?: number): Promise<void>;
    get(key: string): Promise<void>;
    delete(key: string): Promise<void>;
}
