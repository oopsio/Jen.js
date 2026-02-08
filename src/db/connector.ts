import { DBConfig, IDBDriver } from "./types";
import { JDBDriver } from "./drivers/jdb";
import { SQLDriver } from "./drivers/sql";

export class DBConnector {
  static create(config: DBConfig): IDBDriver {
    switch (config.type) {
      case "jdb":
        return new JDBDriver(config);
      case "sqlite":
      case "postgres":
      case "mysql":
        return new SQLDriver(config);
      default:
        throw new Error(`Unsupported DB type: ${config.type}`);
    }
  }
}
