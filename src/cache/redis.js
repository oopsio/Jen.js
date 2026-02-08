// Redis cache utilities - external Redis library not included
// Users should implement with their own redis library (e.g., npm install redis)
export class RedisCache {
  async connect() {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  async set(key, value, ttlSec) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  async get(key) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  async delete(key) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
}
