import { DBConnector } from "./connector.js";
export * from "./types.js";
export * from "./connector.js";
export class DB {
    driver;
    constructor(config) {
        this.driver = DBConnector.create(config);
    }
    async connect() { await this.driver.connect(); }
    async disconnect() { await this.driver.disconnect(); }
    async query(q) { return this.driver.query(q); }
    async find(coll, where) { return this.driver.query({ find: coll, where }); }
    async create(coll, data) { return this.driver.create(coll, data); }
    async update(coll, filter, update) { return this.driver.update(coll, filter, update); }
    async delete(coll, filter) { return this.driver.delete(coll, filter); }
    async count(coll, filter) { return this.driver.count(coll, filter); }
}
