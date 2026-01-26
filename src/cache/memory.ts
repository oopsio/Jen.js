export class MemoryCache {
  private store: Map<string, any> = new Map();

  set(key: string, value: any, ttlMs?: number) {
    this.store.set(key, value);
    if(ttlMs) setTimeout(() => this.store.delete(key), ttlMs);
  }

  get(key: string) {
    return this.store.get(key);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}
