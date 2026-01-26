import { DBConfig, QueryResult } from './types';
import { SchemaManager } from './schema';
import { LuaHooks } from './luaHooks';
import { SQLiteDriver } from './drivers/sqlite';
import { PostgresDriver } from './drivers/postgres';
import { MySQLDriver } from './drivers/mysql';
import { MongoDriver } from './drivers/mongo';

export class DB {
  config: DBConfig;
  schema: SchemaManager;
  lua: LuaHooks;

  sqlite = new SQLiteDriver();
  postgres = new PostgresDriver();
  mysql = new MySQLDriver();
  mongo = new MongoDriver();

  constructor(config: DBConfig, schema: SchemaManager, lua: LuaHooks) {
    this.config = config;
    this.schema = schema;
    this.lua = lua;
  }

  async connect() {
    switch(this.config.driver) {
      case 'sqlite': await this.sqlite.connect(this.config.connectionString); break;
      case 'postgres': this.postgres.connect(this.config.connectionString); break;
      case 'mysql': this.mysql.connect(this.config.connectionString); break;
      case 'mongodb': await this.mongo.connect(this.config.connectionString); break;
      default: throw new Error('Unsupported driver');
    }
  }

  async query<T=any>(table: string, sqlOrFilter: any, params: any[] = []): Promise<QueryResult<T>> {
    this.lua.run(table, 'query', { sqlOrFilter, params });
    switch(this.config.driver) {
      case 'sqlite': return this.sqlite.query<T>(sqlOrFilter, params);
      case 'postgres': return this.postgres.query<T>(sqlOrFilter, params);
      case 'mysql': return this.mysql.query<T>(sqlOrFilter, params);
      case 'mongodb': return this.mongo.query<T>(table, sqlOrFilter);
    }
  }
}
