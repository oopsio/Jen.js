export class PostgresDriver {
    connect(connectionString) {
        throw new Error('PostgreSQL implementation requires external library. Install: npm install pg');
    }
    async query(sql, params = []) {
        throw new Error('PostgreSQL implementation requires external library. Install: npm install pg');
    }
}
