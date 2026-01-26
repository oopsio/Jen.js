import { SQLiteDriver } from './drivers/sqlite';
import { PostgresDriver } from './drivers/postgres';
import { MySQLDriver } from './drivers/mysql';
import { MongoDriver } from './drivers/mongo';
export class DB {
    config;
    schema;
    lua;
    sqlite = new SQLiteDriver();
    postgres = new PostgresDriver();
    mysql = new MySQLDriver();
    mongo = new MongoDriver();
    constructor(config, schema, lua) {
        this.config = config;
        this.schema = schema;
        this.lua = lua;
    }
    async connect() {
        switch (this.config.driver) {
            case 'sqlite':
                await this.sqlite.connect(this.config.connectionString);
                break;
            case 'postgres':
                this.postgres.connect(this.config.connectionString);
                break;
            case 'mysql':
                this.mysql.connect(this.config.connectionString);
                break;
            case 'mongodb':
                await this.mongo.connect(this.config.connectionString);
                break;
            default: throw new Error('Unsupported driver');
        }
    }
    async query(table, sqlOrFilter, params = []) {
        switch (this.config.driver) {
            case 'sqlite': return await this.sqlite.query(sqlOrFilter, params);
            case 'postgres': return await this.postgres.query(sqlOrFilter, params);
            case 'mysql': return await this.mysql.query(sqlOrFilter, params);
            case 'mongodb': return await this.mongo.query(table, sqlOrFilter);
            default: throw new Error('Unsupported driver');
        }
    }
}
