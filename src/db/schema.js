export class SchemaManager {
    schemas = {};
    register(table, schema) {
        this.schemas[table] = schema;
    }
    get(table) {
        const s = this.schemas[table];
        if (!s)
            throw new Error(`Schema not found: ${table}`);
        return s;
    }
    all() {
        return this.schemas;
    }
}
