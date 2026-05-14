import type { CollectorIssues } from '../IssueCollector.js';
import { type Results } from '../run.js';
import type { MainOptions } from '../util/create-options.js';
import type { WatchChange } from '../util/watch.js';
import { type FileDescriptorOptions } from './file-descriptor.js';
import { type PackageJsonFile } from './package-json-descriptor.js';
import type { File } from './types.js';
type WatchUpdate = {
    duration: number;
    mem: number;
};
export interface Session {
    handleFileChanges(changes: WatchChange[]): Promise<WatchUpdate>;
    getIssues(): CollectorIssues;
    getResults(): Results;
    describeFile(filePath: string, options?: FileDescriptorOptions): File | undefined;
    describePackageJson(): PackageJsonFile;
}
export declare const createSession: (options: MainOptions) => Promise<Session>;
export {};
