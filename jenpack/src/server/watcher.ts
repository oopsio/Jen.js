import { watch } from "chokidar";
import type { FSWatcher } from "chokidar";
import type { WatcherConfig } from "../types.js";
import { debug } from "../utils/log.js";

export type FileChangeCallback = (
  path: string,
  type: "add" | "change" | "unlink",
) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private callbacks: Set<FileChangeCallback> = new Set();
  private config: WatcherConfig;

  constructor(config: WatcherConfig) {
    this.config = config;
  }

  async watch(): Promise<void> {
    const ignored = this.config.ignored || [
      "**/node_modules/**",
      "**/.git/**",
      "**/.jenpack-cache/**",
      "**/dist/**",
      "**/build/**",
    ];

    this.watcher = watch(this.config.root, {
      ignored,
      ignoreInitial: this.config.ignoreInitial !== false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    });

    this.watcher.on("add", (path) => {
      debug(`[watcher] File added: ${path}`);
      this.emit(path, "add");
    });

    this.watcher.on("change", (path) => {
      debug(`[watcher] File changed: ${path}`);
      this.emit(path, "change");
    });

    this.watcher.on("unlink", (path) => {
      debug(`[watcher] File removed: ${path}`);
      this.emit(path, "unlink");
    });

    return new Promise((resolve) => {
      this.watcher?.on("ready", () => {
        debug("[watcher] Ready");
        resolve();
      });
    });
  }

  onChange(callback: FileChangeCallback): void {
    this.callbacks.add(callback);
  }

  private emit(path: string, type: "add" | "change" | "unlink"): void {
    for (const callback of this.callbacks) {
      try {
        callback(path, type);
      } catch (error) {
        debug(`Error in watcher callback: ${(error as Error).message}`);
      }
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.watcher) {
        this.watcher.close().then(resolve);
      } else {
        resolve();
      }
    });
  }
}

export function createWatcher(config: WatcherConfig): FileWatcher {
  return new FileWatcher(config);
}
