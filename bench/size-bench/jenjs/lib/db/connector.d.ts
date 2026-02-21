import { DBConfig, IDBDriver } from "./types";
export declare class DBConnector {
    static create(config: DBConfig): IDBDriver;
}
