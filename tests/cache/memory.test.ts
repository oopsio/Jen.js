import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock in-memory cache implementation
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;

  constructor(defaultTTLMs: number = 3600000) {
    this.defaultTTL = defaultTTLMs;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    let count = 0;
    for (const [, entry] of this.cache.entries()) {
      if (Date.now() <= entry.expiresAt) {
        count++;
      }
    }
    return count;
  }

  getExpiredCount(): number {
    let count = 0;
    for (const [, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        count++;
      }
    }
    return count;
  }

  prune(): number {
    let pruned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

describe("Memory Cache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(3600000); // 1 hour default TTL
  });

  describe("Set and Get", () => {
    it("should set and retrieve a value", () => {
      cache.set("key1", "value1");
      const value = cache.get<string>("key1");
      expect(value).toBe("value1");
    });

    it("should set and retrieve different types", () => {
      cache.set("string", "text");
      cache.set("number", 42);
      cache.set("object", { id: 1, name: "test" });
      cache.set("array", [1, 2, 3]);
      cache.set("boolean", true);

      expect(cache.get("string")).toBe("text");
      expect(cache.get("number")).toBe(42);
      expect(cache.get("object")).toEqual({ id: 1, name: "test" });
      expect(cache.get("array")).toEqual([1, 2, 3]);
      expect(cache.get("boolean")).toBe(true);
    });

    it("should return null for non-existent key", () => {
      const value = cache.get("nonexistent");
      expect(value).toBeNull();
    });

    it("should overwrite existing key", () => {
      cache.set("key", "value1");
      cache.set("key", "value2");
      expect(cache.get("key")).toBe("value2");
    });

    it("should handle null values", () => {
      cache.set("nullKey", null);
      const value = cache.get("nullKey");
      expect(value).toBeNull(); // Ambiguous: null value or not found
    });

    it("should handle undefined values", () => {
      cache.set("undefinedKey", undefined);
      const value = cache.get("undefinedKey");
      expect(value).toBeUndefined();
    });
  });

  describe("TTL and Expiration", () => {
    it("should expire entries after TTL", async () => {
      const cache2 = new MemoryCache(100); // 100ms TTL
      cache2.set("key", "value");
      expect(cache2.get("key")).toBe("value");

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache2.get("key")).toBeNull();
    });

    it("should support custom TTL per entry", async () => {
      const cache2 = new MemoryCache(10000); // 10s default
      cache2.set("short", "value", 50); // 50ms custom TTL
      cache2.set("long", "value", 10000);

      expect(cache2.get("short")).toBe("value");
      expect(cache2.get("long")).toBe("value");

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache2.get("short")).toBeNull();
      expect(cache2.get("long")).toBe("value");
    });

    it("should not expire entries before TTL", async () => {
      cache.set("key", "value", 200);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get("key")).toBe("value");
    });

    it("should return null for expired entries", async () => {
      const cache2 = new MemoryCache(50);
      cache2.set("key", "value");
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache2.get("key")).toBeNull();
    });
  });

  describe("Delete and Clear", () => {
    it("should delete a key", () => {
      cache.set("key", "value");
      expect(cache.has("key")).toBe(true);
      
      const deleted = cache.delete("key");
      expect(deleted).toBe(true);
      expect(cache.has("key")).toBe(false);
    });

    it("should return false when deleting non-existent key", () => {
      const deleted = cache.delete("nonexistent");
      expect(deleted).toBe(false);
    });

    it("should clear all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      
      cache.clear();
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBeNull();
    });

    it("should have size 0 after clear", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("Has and Size", () => {
    it("should check if key exists", () => {
      cache.set("exists", "value");
      expect(cache.has("exists")).toBe(true);
      expect(cache.has("notexists")).toBe(false);
    });

    it("should return false for expired keys", async () => {
      const cache2 = new MemoryCache(50);
      cache2.set("key", "value");
      expect(cache2.has("key")).toBe(true);
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache2.has("key")).toBe(false);
    });

    it("should return correct size", () => {
      expect(cache.size()).toBe(0);
      
      cache.set("key1", "value1");
      expect(cache.size()).toBe(1);
      
      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);
      
      cache.delete("key1");
      expect(cache.size()).toBe(1);
    });

    it("should not count expired entries in size", async () => {
      const cache2 = new MemoryCache(50);
      cache2.set("key", "value");
      expect(cache2.size()).toBe(1);
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache2.size()).toBe(0);
    });
  });

  describe("Pruning", () => {
    it("should prune expired entries", async () => {
      const cache2 = new MemoryCache(100);
      cache2.set("key1", "value");
      cache2.set("key2", "value");
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      const pruned = cache2.prune();
      
      expect(pruned).toBeGreaterThan(0);
      expect(cache2.has("key1")).toBe(false);
      expect(cache2.has("key2")).toBe(false);
    });

    it("should not prune valid entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      
      const pruned = cache.prune();
      expect(pruned).toBe(0);
      
      expect(cache.has("key1")).toBe(true);
      expect(cache.has("key2")).toBe(true);
    });

    it("should return count of pruned entries", async () => {
      const cache2 = new MemoryCache(50);
      cache2.set("key1", "value1");
      cache2.set("key2", "value2");
      cache2.set("key3", "value3");
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      const pruned = cache2.prune();
      expect(pruned).toBe(3);
    });
  });

  describe("Concurrency", () => {
    it("should handle concurrent reads and writes", async () => {
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            cache.set(`key${i}`, `value${i}`);
            return cache.get(`key${i}`);
          })
        );
      }
      
      const results = await Promise.all(promises);
      expect(results.every((r) => r !== null)).toBe(true);
      expect(cache.size()).toBe(100);
    });

    it("should handle rapid consecutive operations", () => {
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
        if (i % 10 === 0) cache.get(`key${i}`);
        if (i % 20 === 0) cache.delete(`key${i}`);
      }
      
      expect(cache.size()).toBeGreaterThan(0);
      expect(cache.size()).toBeLessThanOrEqual(1000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large values", () => {
      const largeArray = new Array(100000).fill("x");
      cache.set("large", largeArray);
      expect(cache.get("large")).toHaveLength(100000);
    });

    it("should handle special characters in keys", () => {
      cache.set("key:with:colons", "value");
      cache.set("key/with/slashes", "value");
      cache.set("key@with@at", "value");
      
      expect(cache.has("key:with:colons")).toBe(true);
      expect(cache.has("key/with/slashes")).toBe(true);
      expect(cache.has("key@with@at")).toBe(true);
    });

    it("should handle empty string as key", () => {
      cache.set("", "value");
      expect(cache.get("")).toBe("value");
    });

    it("should handle empty string as value", () => {
      cache.set("key", "");
      expect(cache.get("key")).toBe("");
    });
  });
});
