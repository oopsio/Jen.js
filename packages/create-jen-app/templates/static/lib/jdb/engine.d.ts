import { JDBConfig, IDatabaseEngine, ICollection, Document } from "./types";
/**
 * File-based database engine implementation.
 * Stores collections as JSON files in the configured directory.
 * Provides lazy collection initialization and in-memory option for testing.
 */
export declare class JDBEngine implements IDatabaseEngine {
    private config;
    /** Cached collection instances. Created on demand and reused for subsequent accesses. */
    private collections;
    /**
     * Create a new database engine instance.
     *
     * @param config Configuration specifying storage root directory and memory mode.
     */
    constructor(config: JDBConfig);
    /**
     * Establish database connection by ensuring the storage root directory exists.
     * Creates the directory recursively if it doesn't exist.
     */
    connect(): Promise<void>;
    /**
     * Close database connection and clean up resources.
     * Currently a no-op for file-based storage, but provided for compatibility with IDatabaseEngine interface.
     * Future versions may flush pending writes or close file handles here.
     */
    disconnect(): Promise<void>;
    /**
     * Get or create a collection by name.
     * Collections are cached after first access, so subsequent calls return the same instance.
     * Uses lazy initialization: data is not loaded from disk until the collection is accessed.
     *
     * @template T Document type for the collection.
     * @param name Unique name for the collection. Used to generate the .jdb filename.
     * @returns Collection instance for CRUD operations.
     */
    collection<T extends Document>(name: string): ICollection<T>;
}
