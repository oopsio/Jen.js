/**
 * File-based storage provider for production
 */
import type { CacheEntry } from '../types';
import { StorageProvider } from './storage-provider';

/**
 * File storage with configurable directory
 */
export class FileStorage extends StorageProvider {
  constructor(private cacheDir: string) {
    super();
  }

  /**
   * Get cache key to file path
   */
  private getFilePath(key: string): string {
    // Sanitize key to be filesystem-safe
    const sanitized = key
      .replace(/[^a-zA-Z0-9._/-]/g, '_')
      .replace(/\//g, '__');
    return `${this.cacheDir}/${sanitized}.json`;
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const filePath = this.getFilePath(key);
      // Use dynamic import for file operations (runtime agnostic)
      const { readFile } = await this.getFileModule();
      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data) as CacheEntry;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      const { writeFile, mkdir } = await this.getFileModule();
      
      // Ensure directory exists
      await mkdir(this.cacheDir, { recursive: true });
      
      // Write with pretty formatting
      await writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write cache: ${String(error)}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      const { unlink } = await this.getFileModule();
      await unlink(filePath);
    } catch {
      // File may not exist, which is fine
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(key);
      const { access } = await this.getFileModule();
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the appropriate file module based on runtime
   */
  private async getFileModule() {
    // Try to detect runtime and use appropriate module
    if (typeof Deno !== 'undefined') {
      // Deno
      return {
        readFile: async (path: string) => Deno.readTextFile(path),
        writeFile: async (path: string, data: string) => Deno.writeTextFile(path, data),
        mkdir: async (path: string, _opts: any) => Deno.mkdir(path, { recursive: true }),
        unlink: async (path: string) => Deno.remove(path),
        access: async (path: string) => Deno.stat(path),
      };
    } else if (typeof window === 'undefined' && typeof process !== 'undefined') {
      // Node.js or Bun
      const fs = await import('fs').then((m: any) => m.promises);
      return {
        readFile: (path: string, encoding: string) => fs.readFile(path, encoding),
        writeFile: (path: string, data: string, encoding: string) => fs.writeFile(path, data, encoding),
        mkdir: (path: string, opts: any) => fs.mkdir(path, opts),
        unlink: (path: string) => fs.unlink(path),
        access: (path: string) => fs.access(path),
      };
    }
    throw new Error('Unsupported runtime for FileStorage');
  }
}
