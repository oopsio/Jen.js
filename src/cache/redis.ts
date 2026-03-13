// @ts-ignore - redis may not have complete types
import { createClient } from "redis";

type RedisClient = any;
import { log } from "../shared/log.js";

/**
 * Configuration for Redis connection.
 */
interface RedisClientConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  url?: string;
}

/**
 * Redis cache implementation for distributed caching.
 *
 * Requires the redis package: npm install redis
 * Suitable for multi-process deployments where shared cache is needed.
 *
 * @example
 * ```typescript
 * const cache = new RedisCache({
 *   host: "localhost",
 *   port: 6379,
 * });
 * await cache.connect();
 * await cache.set("user:123", { id: 123, name: "John" }, 3600);
 * const user = await cache.get("user:123");
 * await cache.delete("user:123");
 * ```
 */
export class RedisCache {
  private client: RedisClient | null = null;
  private config: RedisClientConfig;

  /**
   * Create a new Redis cache instance.
   * @param config Redis connection configuration (optional, uses defaults if not provided).
   */
  constructor(config: Partial<RedisClientConfig> = {}) {
    this.config = {
      host: config.host || process.env.REDIS_HOST || "localhost",
      port: config.port || parseInt(process.env.REDIS_PORT || "6379", 10),
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || 0,
      url: config.url || process.env.REDIS_URL,
    };
  }

  /**
   * Connect to Redis server.
   * Creates a new client connection and verifies it works.
   * @throws Error if connection fails.
   *
   * @example
   * ```typescript
   * const cache = new RedisCache();
   * await cache.connect();
   * ```
   */
  async connect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        log.info("Redis client already connected");
        return;
      }

      const clientConfig: any = this.config.url
        ? { url: this.config.url }
        : {
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
            db: this.config.db,
          };

      this.client = createClient(clientConfig);
      await this.client.connect();
      log.info(`Redis connected to ${this.config.host}:${this.config.port}`);
    } catch (error) {
      log.error(
        `Redis connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Store a value in Redis with optional time-to-live.
   * @param key - Cache key identifier.
   * @param value - Value to store (serialized to JSON).
   * @param ttlSec - Time-to-live in seconds. If omitted, key persists indefinitely.
   * @throws Error if not connected or storage fails.
   *
   * @example
   * ```typescript
   * await cache.set("user:123", { id: 123, name: "John" }, 3600);
   * ```
   */
  async set(key: string, value: any, ttlSec?: number): Promise<void> {
    try {
      if (!this.client?.isOpen) {
        throw new Error("Redis client not connected. Call connect() first.");
      }

      const serialized = JSON.stringify(value);
      if (ttlSec !== undefined && ttlSec > 0) {
        await this.client.setEx(key, ttlSec, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      log.info(`Cache set: ${key}${ttlSec ? ` (TTL: ${ttlSec}s)` : ""}`);
    } catch (error) {
      log.error(
        `Redis set failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Retrieve a value from Redis.
   * @param key - Cache key identifier.
   * @returns Stored value or undefined if key does not exist or is expired.
   * @throws Error if not connected or retrieval fails.
   *
   * @example
   * ```typescript
   * const user = await cache.get("user:123");
   * if (user) console.log(user.name);
   * ```
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    try {
      if (!this.client?.isOpen) {
        throw new Error("Redis client not connected. Call connect() first.");
      }

      const cached = await this.client.get(key);
      if (!cached) {
        return undefined;
      }

      return JSON.parse(cached) as T;
    } catch (error) {
      log.error(
        `Redis get failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete a value from Redis.
   * Safe to call on non-existent keys (no-op in Redis).
   * @param key - Cache key identifier.
   * @throws Error if not connected or deletion fails.
   *
   * @example
   * ```typescript
   * await cache.delete("user:123");
   * ```
   */
  async delete(key: string): Promise<void> {
    try {
      if (!this.client?.isOpen) {
        throw new Error("Redis client not connected. Call connect() first.");
      }

      await this.client.del(key);
      log.info(`Cache deleted: ${key}`);
    } catch (error) {
      log.error(
        `Redis delete failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis.
   * @param key - Cache key identifier.
   * @returns True if key exists, false otherwise.
   * @throws Error if not connected.
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client?.isOpen) {
        throw new Error("Redis client not connected. Call connect() first.");
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      log.error(
        `Redis exists check failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Clear all keys in the current Redis database.
   * WARNING: This removes all cached data!
   * @throws Error if not connected.
   *
   * @example
   * ```typescript
   * await cache.flush(); // Clear all cache
   * ```
   */
  async flush(): Promise<void> {
    try {
      if (!this.client?.isOpen) {
        throw new Error("Redis client not connected. Call connect() first.");
      }

      await this.client.flushDb();
      log.info("Redis cache flushed");
    } catch (error) {
      log.error(
        `Redis flush failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Close the Redis connection.
   * Should be called during application shutdown.
   * @throws Error if disconnection fails.
   *
   * @example
   * ```typescript
   * await cache.disconnect();
   * ```
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.quit();
        log.info("Redis disconnected");
      }
    } catch (error) {
      log.error(
        `Redis disconnect failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
