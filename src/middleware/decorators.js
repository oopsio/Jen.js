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

// Simple in-memory storage for metadata if Reflect is not available
// This avoids the 'reflect-metadata' dependency
const MetadataStorage = new WeakMap();
function getMetadata(key, target, propertyKey) {
  // @ts-ignore
  if (typeof Reflect !== "undefined" && Reflect.getMetadata) {
    // @ts-ignore
    return Reflect.getMetadata(key, target, propertyKey);
  }
  const targetMap = MetadataStorage.get(target);
  if (!targetMap) return undefined;
  const mapKey = propertyKey ? `${String(key)}:${String(propertyKey)}` : key;
  return targetMap.get(mapKey);
}
function defineMetadata(key, value, target, propertyKey) {
  // @ts-ignore
  if (typeof Reflect !== "undefined" && Reflect.defineMetadata) {
    // @ts-ignore
    return Reflect.defineMetadata(key, value, target, propertyKey);
  }
  let targetMap = MetadataStorage.get(target);
  if (!targetMap) {
    targetMap = new Map();
    MetadataStorage.set(target, targetMap);
  }
  const mapKey = propertyKey ? `${String(key)}:${String(propertyKey)}` : key;
  targetMap.set(mapKey, value);
}
export const MIDDLEWARE_METADATA_KEY = Symbol("jen:middleware");
export function UseMiddleware(...middleware) {
  return function (target, propertyKey, descriptor) {
    if (descriptor) {
      // Method decorator
      const existing =
        getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, ...middleware],
        target,
        propertyKey,
      );
    } else {
      // Class decorator
      const existing = getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, ...middleware],
        target,
      );
    }
  };
}
