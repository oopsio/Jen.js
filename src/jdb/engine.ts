import path from "path";
import {
  JDBConfig,
  IDatabaseEngine,
  ICollection,
  Document,
  Filter,
  Update,
  QueryOptions,
} from "./types";
import {
  ensureDir,
  readJSON,
  writeJSON,
  generateId,
  matchFilter,
  applyUpdate,
} from "./utils";

class JDBCollection<T extends Document> implements ICollection<T> {
  private file: string;
  private data: T[] = [];
  private loaded = false;
  private saving = false;
  private queueSave = false;

  constructor(
    public name: string,
    private dir: string,
    private inMemory: boolean,
  ) {
    this.file = path.join(dir, `${name}.jdb`);
  }

  private async load() {
    if (this.loaded) return;
    if (!this.inMemory) {
      await ensureDir(this.dir);
      const content = await readJSON<T[]>(this.file);
      this.data = content || [];
    }
    this.loaded = true;
  }

  private async save() {
    if (this.inMemory) return;
    if (this.saving) {
      this.queueSave = true;
      return;
    }
    this.saving = true;
    try {
      await writeJSON(this.file, this.data);
    } finally {
      this.saving = false;
      if (this.queueSave) {
        this.queueSave = false;
        this.save();
      }
    }
  }

  async insert(
    doc: Omit<T, "_id" | "_created" | "_updated"> & { _id?: string },
  ): Promise<T> {
    await this.load();
    const now = Date.now();
    const newDoc = {
      _id: doc._id || generateId(),
      _created: now,
      _updated: now,
      ...doc,
    } as T;
    this.data.push(newDoc);
    this.save();
    return newDoc;
  }

  async insertMany(
    docs: (Omit<T, "_id" | "_created" | "_updated"> & { _id?: string })[],
  ): Promise<T[]> {
    await this.load();
    const now = Date.now();
    const newDocs = docs.map((doc) => ({
      _id: doc._id || generateId(),
      _created: now,
      _updated: now,
      ...doc,
    })) as T[];
    this.data.push(...newDocs);
    this.save();
    return newDocs;
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    await this.load();
    return this.data.find((doc) => matchFilter(doc, filter)) || null;
  }

  async find(filter: Filter<T>, options?: QueryOptions): Promise<T[]> {
    await this.load();
    let result = this.data.filter((doc) => matchFilter(doc, filter));

    if (options?.sort) {
      const sortKeys = Object.keys(options.sort);
      result.sort((a, b) => {
        for (const key of sortKeys) {
          const dir = options.sort![key];
          if (a[key] < b[key]) return -1 * dir;
          if (a[key] > b[key]) return 1 * dir;
        }
        return 0;
      });
    }

    if (options?.skip) {
      result = result.slice(options.skip);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async update(
    filter: Filter<T>,
    update: Update<T>,
    multi = false,
  ): Promise<number> {
    await this.load();
    let count = 0;
    for (const doc of this.data) {
      if (matchFilter(doc, filter)) {
        applyUpdate(doc, update);
        count++;
        if (!multi) break;
      }
    }
    if (count > 0) this.save();
    return count;
  }

  async delete(filter: Filter<T>, multi = false): Promise<number> {
    await this.load();
    const originalLen = this.data.length;
    if (!multi) {
      const index = this.data.findIndex((doc) => matchFilter(doc, filter));
      if (index !== -1) {
        this.data.splice(index, 1);
        this.save();
        return 1;
      }
      return 0;
    } else {
      this.data = this.data.filter((doc) => !matchFilter(doc, filter));
      const deleted = originalLen - this.data.length;
      if (deleted > 0) this.save();
      return deleted;
    }
  }

  async count(filter: Filter<T>): Promise<number> {
    await this.load();
    return this.data.filter((doc) => matchFilter(doc, filter)).length;
  }
}

export class JDBEngine implements IDatabaseEngine {
  private collections = new Map<string, JDBCollection<any>>();

  constructor(private config: JDBConfig) {}

  async connect() {
    await ensureDir(this.config.root);
  }

  async disconnect() {
    // No-op for file based, maybe ensure all saves are flushed
  }

  collection<T extends Document>(name: string): ICollection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(
        name,
        new JDBCollection<T>(name, this.config.root, !!this.config.inMemory),
      );
    }
    return this.collections.get(name)!;
  }
}
