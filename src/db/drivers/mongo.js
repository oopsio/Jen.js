export class MongoDriver {
    async connect(connectionString, dbName) {
        throw new Error('MongoDB implementation requires external library. Install: npm install mongodb');
    }
    async query(collection, filter = {}) {
        throw new Error('MongoDB implementation requires external library. Install: npm install mongodb');
    }
}
