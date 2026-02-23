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
 * Metadata storage for decorator information.
 * Provides a fallback when Reflect.metadata is not available.
 * This avoids adding the reflect-metadata dependency for basic decorator support.
 *
 * Uses WeakMap for automatic cleanup when target objects are garbage collected.
 */
const MetadataStorage = new WeakMap();
/**
 * Retrieves metadata attached to a target via decorators.
 * Uses the Reflect API if available; otherwise falls back to WeakMap storage.
 *
 * @param key The metadata key (usually a Symbol).
 * @param target The class or object to get metadata from.
 * @param propertyKey Optional property name for method/property-level metadata.
 * @returns The metadata value, or undefined if not found.
 */
function getMetadata(key, target, propertyKey) {
    // Use native Reflect API if available for better compatibility.
    // @ts-ignore
    if (typeof Reflect !== "undefined" && Reflect.getMetadata) {
        // @ts-ignore
        return Reflect.getMetadata(key, target, propertyKey);
    }
    const targetMap = MetadataStorage.get(target);
    if (!targetMap)
        return undefined;
    const mapKey = propertyKey ? `${String(key)}:${String(propertyKey)}` : key;
    return targetMap.get(mapKey);
}
/**
 * Stores metadata on a target for use by decorators.
 * Uses the Reflect API if available; otherwise falls back to WeakMap storage.
 *
 * @param key The metadata key (usually a Symbol).
 * @param value The value to store.
 * @param target The class or object to attach metadata to.
 * @param propertyKey Optional property name for method/property-level metadata.
 */
function defineMetadata(key, value, target, propertyKey) {
    // Use native Reflect API if available for better compatibility.
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
// Unique symbol to store middleware metadata on classes and methods.
export const MIDDLEWARE_METADATA_KEY = Symbol("jen:middleware");
/**
 * Class or method decorator for attaching middleware to handlers.
 * Allows declaring middleware dependencies declaratively on class definitions or methods.
 * Middleware is merged with existing middleware if applied multiple times.
 *
 * @param middleware Middleware functions to attach.
 * @returns A decorator function compatible with class or method decoration.
 *
 * @example
 * @UseMiddleware(authMiddleware, corsMiddleware)
 * class UserController {
 *   @UseMiddleware(rateLimitMiddleware)
 *   async getUsers(ctx) { ... }
 * }
 */
export function UseMiddleware(...middleware) {
    return function (target, propertyKey, descriptor) {
        if (descriptor) {
            // Method decorator: attach middleware to a specific method.
            const existing = getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
            defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, ...middleware], target, propertyKey);
        }
        else {
            // Class decorator: attach middleware to all methods in the class.
            const existing = getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
            defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, ...middleware], target);
        }
    };
}
