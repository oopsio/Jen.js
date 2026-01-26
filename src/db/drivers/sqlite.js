export class SQLiteDriver {
    async connect(path) {
        throw new Error('SQLite implementation requires external library. Install: npm install sqlite3 sqlite');
    }
    async query(sql, params = []) {
        throw new Error('SQLite implementation requires external library. Install: npm install sqlite3 sqlite');
    }
}
