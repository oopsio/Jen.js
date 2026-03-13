import { MongoClient } from "mongodb";
export class MongoDriver {
    client;
    db;
    constructor(config) {
        this.client = new MongoClient(config.connection);
    }
    async connect() {
        await this.client.connect();
        this.db = this.client.db();
    }
    async disconnect() { await this.client.close(); }
    async query(q) {
        const fq = q;
        return this.db.collection(fq.find).find(fq.where || {}).toArray();
    }
    async create(collection, data) {
        const res = await this.db.collection(collection).insertOne(data);
        return { ...data, _id: res.insertedId };
    }
    async update(collection, filter, update) {
        const res = await this.db.collection(collection).updateMany(filter, { $set: update });
        return res.modifiedCount;
    }
    async delete(collection, filter) {
        const res = await this.db.collection(collection).deleteMany(filter);
        return res.deletedCount;
    }
    async count(collection, filter) {
        return this.db.collection(collection).countDocuments(filter);
    }
}
