import { log } from "../../shared/log.js";
export class SQLDriver {
    connection;
    type;
    constructor(config) {
        this.connection = config.connection;
        this.type = config.type;
    }
    async connect() { log.info(`Connected to ${this.type}`); }
    async disconnect() {
        if (this.connection?.end)
            await this.connection.end();
        else if (this.connection?.close)
            await this.connection.close();
    }
    async execute(sql, params = []) {
        switch (this.type) {
            case "postgres":
                const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);
                const res = await this.connection.query(pgSql, params);
                return res.rows;
            case "mysql":
                const [rows] = await this.connection.execute(sql, params);
                return rows;
            case "sqlite":
                return await this.connection.all(sql, params);
            default:
                throw new Error(`Unsupported SQL type: ${this.type}`);
        }
    }
    async query(q) {
        if (typeof q === "string")
            return this.execute(q);
        if ("sql" in q)
            return this.execute(q.sql, q.params);
        const fq = q;
        let sql = `SELECT * FROM \`${fq.find}\``;
        const params = [];
        if (fq.where) {
            const keys = Object.keys(fq.where);
            sql += ` WHERE ${keys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
            params.push(...Object.values(fq.where));
        }
        return this.execute(sql, params);
    }
    async create(collection, data) {
        const keys = Object.keys(data);
        const sql = `INSERT INTO \`${collection}\` (\`${keys.join("`, `")}\`) VALUES (${keys.map(() => "?").join(",")})`;
        await this.execute(sql, Object.values(data));
        return data;
    }
    async update(collection, filter, update) {
        const uKeys = Object.keys(update);
        const fKeys = Object.keys(filter);
        const sql = `UPDATE \`${collection}\` SET ${uKeys.map(k => `\`${k}\` = ?`).join(",")} WHERE ${fKeys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
        await this.execute(sql, [...Object.values(update), ...Object.values(filter)]);
        return 1;
    }
    async delete(collection, filter) {
        const keys = Object.keys(filter);
        const sql = `DELETE FROM \`${collection}\` WHERE ${keys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
        await this.execute(sql, Object.values(filter));
        return 1;
    }
    async count(collection, filter) {
        const res = await this.query({ find: collection, where: filter });
        return res.length;
    }
}
