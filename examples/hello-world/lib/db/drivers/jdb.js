import { JDBEngine } from "../../jdb";
export class JDBDriver {
    engine;
    constructor(config) {
        const jdbConfig = config.jdb || {
            root: "./data",
            inMemory: false,
        };
        this.engine = new JDBEngine(jdbConfig);
    }
    async connect() {
        await this.engine.connect();
    }
    async disconnect() {
        await this.engine.disconnect();
    }
    async query(q) {
        if (typeof q === "string") {
            throw new Error("Raw string queries not supported in JDB directly. Use object syntax.");
        }
        if ("sql" in q) {
            throw new Error("SQL queries not supported in JDB driver.");
        }
        const query = q;
        const coll = this.engine.collection(query.find);
        return await coll.find(query.where || {}, query.options);
    }
    async create(collection, data) {
        return await this.engine.collection(collection).insert(data);
    }
    async update(collection, filter, update) {
        return await this.engine
            .collection(collection)
            .update(filter, update, true);
    }
    async delete(collection, filter) {
        return await this.engine.collection(collection).delete(filter, true);
    }
    async count(collection, filter) {
        return await this.engine.collection(collection).count(filter);
    }
}
