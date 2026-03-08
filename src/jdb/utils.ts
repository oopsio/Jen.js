import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Ensure a directory exists, creating it recursively if necessary.
 * Idempotent: does not throw if the directory already exists.
 *
 * @param dir Directory path to ensure exists.
 * @throws Error if directory creation fails.
 */
export async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Read and parse a JSON file from disk.
 * Returns null if the file does not exist (ENOENT).
 * Other errors (invalid JSON, permission denied, etc.) are re-thrown.
 *
 * @template T The expected JSON structure type.
 * @param file Path to the JSON file to read.
 * @returns Parsed JSON data, or null if file does not exist.
 * @throws Error if the file exists but cannot be read or parsed.
 */
export async function readJSON<T>(file: string): Promise<T | null> {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch (e: any) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

/**
 * Write data as JSON to a file atomically using a temporary file.
 * Atomic writes prevent corruption if the process crashes during writing.
 * The temporary file is renamed to the target file only after writing completes successfully.
 *
 * @param file Path to the target file (will be created or overwritten).
 * @param data Object to serialize as JSON with pretty-printing (2-space indent).
 * @throws Error if writing or renaming fails.
 */
export async function writeJSON(file: string, data: any) {
  const tempFile = `${file}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
  await fs.rename(tempFile, file);
}

/**
 * Generate a unique identifier for a new document.
 * Uses cryptographically secure UUID v4 generation.
 *
 * @returns A UUID string suitable for use as a document _id.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Test whether a document matches a filter query.
 * Supports MongoDB-like query syntax including operators ($eq, $ne, $gt, etc.) and logical operators ($or, $and).
 * Processes each field condition and returns false if any condition fails (AND semantics).
 * Logical operators $or and $and are processed separately with their respective semantics.
 *
 * @param doc The document to test.
 * @param filter The filter query to apply.
 * @returns True if the document matches all filter conditions, false otherwise.
 *
 * @example
 * matchFilter({ name: 'John', age: 30 }, { name: 'John' }) // true
 * matchFilter({ age: 25 }, { age: { $gte: 18 } }) // true
 * matchFilter({ name: 'Jane' }, { $or: [{ name: 'John' }, { name: 'Jane' }] }) // true
 */
export function matchFilter(doc: any, filter: any): boolean {
  for (const key in filter) {
    if (key === "$or") {
      // OR: at least one filter must match
      if (!filter.$or.some((f: any) => matchFilter(doc, f))) return false;
      continue;
    }
    if (key === "$and") {
      // AND: all filters must match
      if (!filter.$and.every((f: any) => matchFilter(doc, f))) return false;
      continue;
    }

    const val = doc[key];
    const cond = filter[key];

    // If condition is an object (not array), it contains operators
    if (typeof cond === "object" && cond !== null && !Array.isArray(cond)) {
      for (const op in cond) {
        const target = cond[op];
        switch (op) {
          case "$eq":
            if (val !== target) return false;
            break;
          case "$ne":
            if (val === target) return false;
            break;
          case "$gt":
            if (!(val > target)) return false;
            break;
          case "$gte":
            if (!(val >= target)) return false;
            break;
          case "$lt":
            if (!(val < target)) return false;
            break;
          case "$lte":
            if (!(val <= target)) return false;
            break;
          case "$in":
            if (!target.includes(val)) return false;
            break;
          case "$nin":
            if (target.includes(val)) return false;
            break;
          case "$regex":
            if (!new RegExp(target).test(val)) return false;
            break;
        }
      }
    } else {
      // Simple equality check
      if (val !== cond) return false;
    }
  }
  return true;
}

/**
 * Apply update operators to a document, modifying it in place.
 * Automatically updates the _updated timestamp to the current time.
 * Supports $set, $unset, $inc, $push, and $pull operators.
 *
 * @param doc The document to update (modified in place).
 * @param update Update specification with operators.
 *
 * @example
 * const doc = { name: 'John', age: 30, tags: ['js'] };
 * applyUpdate(doc, { $set: { name: 'Jane' }, $inc: { age: 1 }, $push: { tags: 'ts' } });
 * // doc is now { name: 'Jane', age: 31, tags: ['js', 'ts'], _updated: <current-timestamp> }
 */
export function applyUpdate(doc: any, update: any) {
  const now = Date.now();
  doc._updated = now;

  for (const op in update) {
    const fields = update[op];
    for (const key in fields) {
      const val = fields[key];
      switch (op) {
        case "$set":
          // Set field to the specified value
          doc[key] = val;
          break;
        case "$unset":
          // Remove the field from the document
          delete doc[key];
          break;
        case "$inc":
          // Increment numeric field by the specified amount
          doc[key] = (doc[key] || 0) + val;
          break;
        case "$push":
          // Append to array (create array if doesn't exist)
          if (!Array.isArray(doc[key])) doc[key] = [];
          doc[key].push(val);
          break;
        case "$pull":
          // Remove all occurrences of value from array
          if (Array.isArray(doc[key])) {
            doc[key] = doc[key].filter((item: any) => item !== val);
          }
          break;
      }
    }
  }
}
