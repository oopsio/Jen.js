import { DBConfig, IDBDriver } from "./types.js";
import { JDBDriver } from "./drivers/jdb.js";
import { SQLDriver } from "./drivers/sql.js";
import { MongoDriver } from "./drivers/mongo.js";
import { RedisDriver } from "./drivers/redis.js";

export class DBConnector {
  private static instances: Map<string, IDBDriver> = new Map();

  static create(config: DBConfig): IDBDriver {
    switch (config.type) {
      case "jdb": return new JDBDriver(config);
      case "mongodb": return new MongoDriver(config);
      case "redis": return new RedisDriver(config);
      case "sqlite":
      case "postgres":
      case "mysql": return new SQLDriver(config);
      default: throw new Error(`Unsupported DB type: ${config.type}`);
    }
  }

  static get(key: string): IDBDriver | undefined {
    return this.instances.get(key);
  }

  static set(key: string, config: DBConfig): IDBDriver {
    const driver = this.create(config);
    this.instances.set(key, driver);
    return driver;
  }
}