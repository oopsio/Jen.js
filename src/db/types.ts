export type ColumnType = 'string' | 'number' | 'boolean' | 'datetime' | 'uuid';
export type TableSchema = Record<string, ColumnType>;

export type DBDriver = 'sqlite' | 'mysql' | 'postgres' | 'mongodb';

export type DBConfig = {
  driver: DBDriver;
  connectionString: string;
};

export type QueryResult<T = any> = T[];
