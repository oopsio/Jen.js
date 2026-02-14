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

// Redis cache utilities - external Redis library not included
// Users should implement with their own redis library (e.g., npm install redis)

export class RedisCache {
  async connect() {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }

  async set(key: string, value: any, ttlSec?: number) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }

  async get(key: string) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }

  async delete(key: string) {
    throw new Error(
      "Redis implementation requires external library. Install: npm install redis",
    );
  }
}
