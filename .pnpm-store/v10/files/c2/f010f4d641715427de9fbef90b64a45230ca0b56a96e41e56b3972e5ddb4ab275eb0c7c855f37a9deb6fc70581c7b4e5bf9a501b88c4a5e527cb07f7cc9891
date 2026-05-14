import type { SystemContext } from "@chakra-ui/react";
interface ReadResult {
    mod: SystemContext;
    dependencies: string[];
}
interface ReadOptions {
    cwd?: string;
    tsconfig?: string;
}
export declare const read: (file: string, options?: ReadOptions) => Promise<ReadResult>;
export declare function ensureDir(dirPath: string): void;
export declare const write: (path: string, file: string, content: Promise<string>) => Promise<void>;
export declare function watch(paths: string[], cb: () => Promise<void>): void;
export declare function clean(basePath: string): Promise<void>;
export {};
