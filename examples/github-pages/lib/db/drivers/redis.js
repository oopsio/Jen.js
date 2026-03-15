import { createClient } from "redis";
export class RedisDriver {
    client;
    constructor(config) {
        this.client = createClient({ url: config.connection });
    }
    async connect() { await this.client.connect(); }
    async disconnect() { await this.client.quit(); }
    async query(q) {
        const fq = q;
        const keys = await this.client.keys(`${fq.find}:*`);
        const results = [];
        for (const key of keys) {
            const val = await this.client.get(key);
            if (val) {
                const parsed = JSON.parse(val);
                if (!fq.where || Object.entries(fq.where).every(([k, v]) => parsed[k] === v)) {
                    results.push(parsed);
                }
            }
        }
        return results;
    }
    async create(collection, data) {
        const id = data.id || Math.random().toString(36).substring(7);
        const record = { ...data, id };
        await this.client.set(`${collection}:${id}`, JSON.stringify(record));
        return record;
    }
    async update(collection, filter, update) {
        const items = await this.query(collection); // Simple scan
        let count = 0;
        for (const item of items) {
            const obj = item;
            if (Object.entries(filter).every(([k, v]) => obj[k] === v)) {
                const updated = { ...obj, ...update };
                await this.client.set(`${collection}:${obj.id}`, JSON.stringify(updated));
                count++;
            }
        }
        return count;
    }
    async delete(collection, filter) {
        const items = await this.query(collection);
        let count = 0;
        for (const item of items) {
            const obj = item;
            if (Object.entries(filter).every(([k, v]) => obj[k] === v)) {
                await this.client.del(`${collection}:${obj.id}`);
                count++;
            }
        }
        return count;
    }
    async count(collection, filter) {
        const res = await this.query({ find: collection, where: filter });
        return res.length;
    }
}
