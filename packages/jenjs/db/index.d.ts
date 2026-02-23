import { DBConfig, UnifiedQuery } from "./types";
import { Filter, Update } from "../jdb/types";
export * from "./types";
export * from "./drivers/jdb";
export * from "./drivers/sql";
export declare class DB {
    private driver;
    private config;
    constructor(config: DBConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T = any>(q: UnifiedQuery<T> | string, params?: any[]): Promise<T[]>;
    find<T = any>(collection: string, filter?: Filter<T>, options?: any): Promise<T[]>;
    findOne<T = any>(collection: string, filter: Filter<T>): Promise<T | null>;
    create<T = any>(collection: string, data: any): Promise<T>;
    update<T = any>(collection: string, filter: Filter<T>, update: Update<T>): Promise<number>;
    delete<T = any>(collection: string, filter: Filter<T>): Promise<number>;
    count<T = any>(collection: string, filter: Filter<T>): Promise<number>;
}
