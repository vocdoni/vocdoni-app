import type { MainOptions } from './util/create-options.js';
import { type FileDescriptor } from './util/file-entry-cache.js';
export declare class CacheConsultant<T> {
    private isEnabled;
    private cache;
    constructor(name: string, options: MainOptions);
    getFileDescriptor(filePath: string): FileDescriptor<T>;
    reconcile(): void;
}
