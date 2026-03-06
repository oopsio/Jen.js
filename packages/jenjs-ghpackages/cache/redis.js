/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Placeholder Redis cache implementation.
 * The framework does not include the Redis library; users must install it separately.
 * This class provides the API contract; actual implementation requires external redis library.
 * Install with: npm install redis
 *
 * Usage example:
 *   import { RedisCache } from "jenjs";
 *   const cache = new RedisCache();
 *   await cache.connect();
 *   await cache.set("key", { data: "value" }, 3600);
 *   const val = await cache.get("key");
 *
 * Suitable for distributed/multi-process deployments where shared cache is needed.
 */
export class RedisCache {
  /**
   * Connect to Redis server.
   * Requires external redis library to be installed.
   * @throws Always throws if called without external library.
   */
  async connect() {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  /**
   * Store a value in Redis with optional time-to-live.
   * @param key - Cache key identifier.
   * @param value - Value to store (should be serializable to JSON).
   * @param ttlSec - Time-to-live in seconds. If omitted, key persists indefinitely.
   * @throws Always throws if called without external library.
   */
  async set(key, value, ttlSec) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  /**
   * Retrieve a value from Redis.
   * @param key - Cache key identifier.
   * @returns Stored value or undefined if key does not exist.
   * @throws Always throws if called without external library.
   */
  async get(key) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
  /**
   * Delete a value from Redis.
   * Safe to call on non-existent keys (no-op in Redis).
   * @param key - Cache key identifier.
   * @throws Always throws if called without external library.
   */
  async delete(key) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
}
