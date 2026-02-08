export class MemoryCache {
  store = new Map();
  set(key, value, ttlMs) {
    this.store.set(key, value);
    if (ttlMs) setTimeout(() => this.store.delete(key), ttlMs);
  }
  get(key) {
    return this.store.get(key);
  }
  delete(key) {
    this.store.delete(key);
  }
}
