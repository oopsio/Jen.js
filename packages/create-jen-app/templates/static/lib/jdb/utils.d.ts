/**
 * Ensure a directory exists, creating it recursively if necessary.
 * Idempotent: does not throw if the directory already exists.
 *
 * @param dir Directory path to ensure exists.
 * @throws Error if directory creation fails.
 */
export declare function ensureDir(dir: string): Promise<void>;
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
export declare function readJSON<T>(file: string): Promise<T | null>;
/**
 * Write data as JSON to a file atomically using a temporary file.
 * Atomic writes prevent corruption if the process crashes during writing.
 * The temporary file is renamed to the target file only after writing completes successfully.
 *
 * @param file Path to the target file (will be created or overwritten).
 * @param data Object to serialize as JSON with pretty-printing (2-space indent).
 * @throws Error if writing or renaming fails.
 */
export declare function writeJSON(file: string, data: any): Promise<void>;
/**
 * Generate a unique identifier for a new document.
 * Uses cryptographically secure UUID v4 generation.
 *
 * @returns A UUID string suitable for use as a document _id.
 */
export declare function generateId(): string;
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
export declare function matchFilter(doc: any, filter: any): boolean;
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
export declare function applyUpdate(doc: any, update: any): void;
