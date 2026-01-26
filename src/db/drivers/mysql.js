export class MySQLDriver {
    connect(connectionString) {
        throw new Error('MySQL implementation requires external library. Install: npm install mysql2');
    }
    async query(sql, params = []) {
        throw new Error('MySQL implementation requires external library. Install: npm install mysql2');
    }
}
