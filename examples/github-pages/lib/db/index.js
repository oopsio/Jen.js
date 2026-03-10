import { DBConnector } from "./connector";
export * from "./types";
export * from "./drivers/jdb";
export * from "./drivers/sql";
export class DB {
    driver;
    config;
    constructor(config) {
        this.config = config;
        this.driver = DBConnector.create(config);
    }
    async connect() {
        await this.driver.connect();
    }
    async disconnect() {
        await this.driver.disconnect();
    }
    async query(q, params) {
        if (typeof q === "string") {
            return this.driver.query({ sql: q, params });
        }
        return this.driver.query(q);
    }
    // Fluent API Shortcuts
    find(collection, filter, options) {
        return this.driver.query({ find: collection, where: filter, options });
    }
    async findOne(collection, filter) {
        const res = await this.driver.query({
            find: collection,
            where: filter,
            options: { limit: 1 },
        });
        return res[0] || null;
    }
    create(collection, data) {
        return this.driver.create(collection, data);
    }
    update(collection, filter, update) {
        return this.driver.update(collection, filter, update);
    }
    delete(collection, filter) {
        return this.driver.delete(collection, filter);
    }
    count(collection, filter) {
        return this.driver.count(collection, filter);
    }
}
