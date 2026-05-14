import ts from 'typescript';
import type { AsyncCompilers, SyncCompilers } from '../compilers/types.js';
import type { ToSourceFilePath } from '../util/to-source-path.js';
import type { SourceFileManager } from './SourceFileManager.js';
type CreateHostsOptions = {
    cwd: string;
    compilerOptions: ts.CompilerOptions;
    entryPaths: Set<string>;
    compilers: [SyncCompilers, AsyncCompilers];
    toSourceFilePath: ToSourceFilePath;
    useResolverCache: boolean;
    fileManager: SourceFileManager;
};
export declare const createHosts: ({ cwd, compilerOptions, fileManager, entryPaths, compilers, toSourceFilePath, useResolverCache, }: CreateHostsOptions) => {
    fileManager: SourceFileManager;
    compilerHost: ts.CompilerHost;
    resolveModuleNames: (moduleNames: string[], containingFile: string) => Array<ts.ResolvedModuleFull | undefined>;
    languageServiceHost: ts.LanguageServiceHost;
};
export {};
