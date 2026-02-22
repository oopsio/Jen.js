import { JDBConfig, IDatabaseEngine, ICollection, Document } from "./types";
export declare class JDBEngine implements IDatabaseEngine {
  private config;
  private collections;
  constructor(config: JDBConfig);
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  collection<T extends Document>(name: string): ICollection<T>;
}
