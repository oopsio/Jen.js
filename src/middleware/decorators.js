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
