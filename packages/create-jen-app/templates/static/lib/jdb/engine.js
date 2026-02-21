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
import path from "path";
import { ensureDir, readJSON, writeJSON, generateId, matchFilter, applyUpdate, } from "./utils";
/**
 * In-memory representation of a single collection.
 * Manages document storage, serialization, and basic file I/O.
 * Supports lazy loading of data from disk and deferred save operations to batch writes.
 *
 * @template T Document type, must extend the Document base type.
 */
class JDBCollection {
    name;
    dir;
    inMemory;
    /** Absolute path to the .jdb file for this collection. */
    file;
    /** In-memory array of documents. */
    data = [];
    /** Flag indicating whether the data has been loaded from disk. */
    loaded = false;
    /** Flag indicating a save operation is currently in progress. */
    saving = false;
    /** Flag indicating a save was requested while another save was in progress. Triggers another save after current one completes. */
    queueSave = false;
    /**
     * Create a new collection instance.
     * Does not load data until an operation requires it (lazy loading).
     *
     * @param name Name of the collection.
     * @param dir Directory where collection files are stored.
     * @param inMemory If true, data is never persisted to disk.
     */
    constructor(name, dir, inMemory) {
        this.name = name;
        this.dir = dir;
        this.inMemory = inMemory;
        this.file = path.join(dir, `${name}.jdb`);
    }
    /**
     * Load collection data from disk on first access.
     * Uses lazy loading to defer file I/O until actually needed.
     * In-memory collections skip disk reads entirely.
     * Idempotent: subsequent calls return immediately if already loaded.
     */
    async load() {
        if (this.loaded)
            return;
        if (!this.inMemory) {
            await ensureDir(this.dir);
            const content = await readJSON(this.file);
            this.data = content || [];
        }
        this.loaded = true;
    }
    /**
     * Persist collection data to disk.
     * Uses a queue mechanism to batch multiple rapid modifications into a single write.
     * If a save is already in progress, queues the next save to run after current one completes.
     * In-memory collections skip disk writes entirely.
     */
    async save() {
        if (this.inMemory)
            return;
        if (this.saving) {
            this.queueSave = true;
            return;
        }
        this.saving = true;
        try {
            await writeJSON(this.file, this.data);
        }
        finally {
            this.saving = false;
            if (this.queueSave) {
                this.queueSave = false;
                this.save();
            }
        }
    }
    /**
     * Insert a single document into the collection.
     * Automatically assigns a UUID for _id (if not provided) and timestamps for _created and _updated.
     * Queues a save operation to persist the document.
     *
     * @param doc The document to insert, without system fields.
     * @returns The inserted document with _id, _created, and _updated populated.
     */
    async insert(doc) {
        await this.load();
        const now = Date.now();
        const newDoc = {
            _id: doc._id || generateId(),
            _created: now,
            _updated: now,
            ...doc,
        };
        this.data.push(newDoc);
        this.save();
        return newDoc;
    }
    /**
     * Insert multiple documents into the collection atomically.
     * All documents are assigned the same _created timestamp.
     * Queues a single save operation to persist all documents.
     *
     * @param docs Array of documents to insert.
     * @returns Array of inserted documents with all system fields populated.
     */
    async insertMany(docs) {
        await this.load();
        const now = Date.now();
        const newDocs = docs.map((doc) => ({
            _id: doc._id || generateId(),
            _created: now,
            _updated: now,
            ...doc,
        }));
        this.data.push(...newDocs);
        this.save();
        return newDocs;
    }
    /**
     * Find the first document matching the filter.
     *
     * @param filter Query filter to apply.
     * @returns The first matching document, or null if no match found.
     */
    async findOne(filter) {
        await this.load();
        return this.data.find((doc) => matchFilter(doc, filter)) || null;
    }
    /**
     * Find all documents matching the filter with optional sorting and pagination.
     * Applies sort, skip, and limit in that order for correct pagination behavior.
     *
     * @param filter Query filter to apply.
     * @param options Optional QueryOptions for sorting, skipping, and limiting results.
     * @returns Array of matching documents (empty array if no matches).
     */
    async find(filter, options) {
        await this.load();
        let result = this.data.filter((doc) => matchFilter(doc, filter));
        if (options?.sort) {
            const sortKeys = Object.keys(options.sort);
            result.sort((a, b) => {
                for (const key of sortKeys) {
                    const dir = options.sort[key];
                    if (a[key] < b[key])
                        return -1 * dir;
                    if (a[key] > b[key])
                        return 1 * dir;
                }
                return 0;
            });
        }
        if (options?.skip) {
            result = result.slice(options.skip);
        }
        if (options?.limit) {
            result = result.slice(0, options.limit);
        }
        return result;
    }
    /**
     * Update document(s) matching the filter.
     * Applies update operators atomically and updates the _updated timestamp.
     * By default, updates only the first matching document. Set multi=true to update all.
     *
     * @param filter Query filter to select documents to update.
     * @param update Update operators and values to apply.
     * @param multi If false (default), updates only first match. If true, updates all matches.
     * @returns Count of documents updated.
     */
    async update(filter, update, multi = false) {
        await this.load();
        let count = 0;
        for (const doc of this.data) {
            if (matchFilter(doc, filter)) {
                applyUpdate(doc, update);
                count++;
                if (!multi)
                    break;
            }
        }
        if (count > 0)
            this.save();
        return count;
    }
    /**
     * Delete document(s) matching the filter.
     * By default, deletes only the first matching document. Set multi=true to delete all.
     *
     * @param filter Query filter to select documents to delete.
     * @param multi If false (default), deletes only first match. If true, deletes all matches.
     * @returns Count of documents deleted.
     */
    async delete(filter, multi = false) {
        await this.load();
        const originalLen = this.data.length;
        if (!multi) {
            const index = this.data.findIndex((doc) => matchFilter(doc, filter));
            if (index !== -1) {
                this.data.splice(index, 1);
                this.save();
                return 1;
            }
            return 0;
        }
        else {
            this.data = this.data.filter((doc) => !matchFilter(doc, filter));
            const deleted = originalLen - this.data.length;
            if (deleted > 0)
                this.save();
            return deleted;
        }
    }
    /**
     * Count documents matching the filter.
     *
     * @param filter Query filter to apply.
     * @returns Number of documents matching the filter.
     */
    async count(filter) {
        await this.load();
        return this.data.filter((doc) => matchFilter(doc, filter)).length;
    }
}
/**
 * File-based database engine implementation.
 * Stores collections as JSON files in the configured directory.
 * Provides lazy collection initialization and in-memory option for testing.
 */
export class JDBEngine {
    config;
    /** Cached collection instances. Created on demand and reused for subsequent accesses. */
    collections = new Map();
    /**
     * Create a new database engine instance.
     *
     * @param config Configuration specifying storage root directory and memory mode.
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Establish database connection by ensuring the storage root directory exists.
     * Creates the directory recursively if it doesn't exist.
     */
    async connect() {
        await ensureDir(this.config.root);
    }
    /**
     * Close database connection and clean up resources.
     * Currently a no-op for file-based storage, but provided for compatibility with IDatabaseEngine interface.
     * Future versions may flush pending writes or close file handles here.
     */
    async disconnect() {
        // No-op for file based, maybe ensure all saves are flushed
    }
    /**
     * Get or create a collection by name.
     * Collections are cached after first access, so subsequent calls return the same instance.
     * Uses lazy initialization: data is not loaded from disk until the collection is accessed.
     *
     * @template T Document type for the collection.
     * @param name Unique name for the collection. Used to generate the .jdb filename.
     * @returns Collection instance for CRUD operations.
     */
    collection(name) {
        if (!this.collections.has(name)) {
            this.collections.set(name, new JDBCollection(name, this.config.root, !!this.config.inMemory));
        }
        return this.collections.get(name);
    }
}
