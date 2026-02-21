export declare function ensureDir(dir: string): Promise<void>;
export declare function readJSON<T>(file: string): Promise<T | null>;
export declare function writeJSON(file: string, data: any): Promise<void>;
export declare function generateId(): string;
export declare function matchFilter(doc: any, filter: any): boolean;
export declare function applyUpdate(doc: any, update: any): void;
