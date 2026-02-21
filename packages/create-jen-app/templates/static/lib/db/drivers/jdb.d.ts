import { IDBDriver, DBConfig, UnifiedQuery } from "../types";
import { Filter, Update } from "../../jdb/types";
export declare class JDBDriver implements IDBDriver {
    private engine;
    constructor(config: DBConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T = any>(q: UnifiedQuery<T>): Promise<T[]>;
    create<T = any>(collection: string, data: any): Promise<T>;
    update<T = any>(collection: string, filter: Filter<T>, update: Update<T>): Promise<number>;
    delete<T = any>(collection: string, filter: Filter<T>): Promise<number>;
    count<T = any>(collection: string, filter: Filter<T>): Promise<number>;
}
