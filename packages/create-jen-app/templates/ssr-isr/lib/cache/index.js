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
 * Cache layer module providing two implementations:
 * - MemoryCache: In-memory Map-based cache for single-process deployments.
 * - RedisCache: API contract for distributed caching (requires external redis library).
 *
 * Choose MemoryCache for development/testing or single-instance production.
 * Choose RedisCache for multi-process or distributed environments (must install redis separately).
 */
export * from "./memory";
export * from "./redis";
