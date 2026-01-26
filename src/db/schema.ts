import { TableSchema } from './types';

export class SchemaManager {
  private schemas: Record<string, TableSchema> = {};

  register(table: string, schema: TableSchema) {
    this.schemas[table] = schema;
  }

  get(table: string): TableSchema {
    const s = this.schemas[table];
    if (!s) throw new Error(`Schema not found: ${table}`);
    return s;
  }

  all(): Record<string, TableSchema> {
    return this.schemas;
  }
}
