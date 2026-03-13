import { IDBDriver, DBConfig, UnifiedQuery, FindQuery, SQLQuery } from "../types.js";
import { log } from "../../shared/log.js";

export class SQLDriver implements IDBDriver {
  private connection: any;
  private type: string;

  constructor(config: DBConfig) {
    this.connection = config.connection;
    this.type = config.type;
  }

  async connect() { log.info(`Connected to ${this.type}`); }
  async disconnect() {
    if (this.connection?.end) await this.connection.end();
    else if (this.connection?.close) await this.connection.close();
  }

  private async execute(sql: string, params: any[] = []): Promise<any[]> {
    switch (this.type) {
      case "postgres":
        const pgSql = sql.replace(/\?/g, (_, i) => `$${i + 1}`);
        const res = await this.connection.query(pgSql, params);
        return res.rows;
      case "mysql":
        const [rows] = await this.connection.execute(sql, params);
        return rows as any[];
      case "sqlite":
        return await this.connection.all(sql, params);
      default:
        throw new Error(`Unsupported SQL type: ${this.type}`);
    }
  }

  async query<T = any>(q: UnifiedQuery<T>): Promise<T[]> {
    if (typeof q === "string") return this.execute(q);
    if ("sql" in q) return this.execute(q.sql, (q as SQLQuery).params);

    const fq = q as FindQuery;
    let sql = `SELECT * FROM \`${fq.find}\``;
    const params: any[] = [];

    if (fq.where) {
      const keys = Object.keys(fq.where);
      sql += ` WHERE ${keys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
      params.push(...Object.values(fq.where));
    }
    return this.execute(sql, params);
  }

  async create<T = any>(collection: string, data: any): Promise<T> {
    const keys = Object.keys(data);
    const sql = `INSERT INTO \`${collection}\` (\`${keys.join("`, `")}\`) VALUES (${keys.map(() => "?").join(",")})`;
    await this.execute(sql, Object.values(data));
    return data;
  }

  async update(collection: string, filter: any, update: any): Promise<number> {
    const uKeys = Object.keys(update);
    const fKeys = Object.keys(filter);
    const sql = `UPDATE \`${collection}\` SET ${uKeys.map(k => `\`${k}\` = ?`).join(",")} WHERE ${fKeys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
    await this.execute(sql, [...Object.values(update), ...Object.values(filter)]);
    return 1;
  }

  async delete(collection: string, filter: any): Promise<number> {
    const keys = Object.keys(filter);
    const sql = `DELETE FROM \`${collection}\` WHERE ${keys.map(k => `\`${k}\` = ?`).join(" AND ")}`;
    await this.execute(sql, Object.values(filter));
    return 1;
  }

  async count(collection: string, filter: any): Promise<number> {
    const res = await this.query({ find: collection, where: filter });
    return res.length;
  }
}