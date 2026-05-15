import ts from 'typescript';
import { CacheConsultant } from './CacheConsultant.js';
import type { AsyncCompilers, SyncCompilers } from './compilers/types.js';
import type { GetImportsAndExportsOptions, IgnoreExportsUsedInFile } from './types/config.js';
import type { Export, ExportMember, FileNode, ModuleGraph } from './types/module-graph.js';
import type { Paths, PrincipalOptions } from './types/project.js';
import type { ResolveModuleNames } from './typescript/resolve-module-names.js';
import { SourceFileManager } from './typescript/SourceFileManager.js';
import type { MainOptions } from './util/create-options.js';
import type { ToSourceFilePath } from './util/to-source-path.js';
export declare class ProjectPrincipal {
    entryPaths: Set<string>;
    projectPaths: Set<string>;
    programPaths: Set<string>;
    skipExportsAnalysis: Set<string>;
    cwd: string;
    compilerOptions: ts.CompilerOptions;
    extensions: Set<string>;
    syncCompilers: SyncCompilers;
    asyncCompilers: AsyncCompilers;
    isWatch: boolean;
    cache: CacheConsultant<FileNode>;
    toSourceFilePath: ToSourceFilePath;
    backend: {
        fileManager: SourceFileManager;
        compilerHost?: ts.CompilerHost;
        resolveModuleNames: ResolveModuleNames;
        program?: ts.Program;
        typeChecker?: ts.TypeChecker;
        languageServiceHost: ts.LanguageServiceHost;
    };
    findReferences?: ts.LanguageService['findReferences'];
    getImplementationAtPosition?: ts.LanguageService['getImplementationAtPosition'];
    constructor(options: MainOptions, { compilerOptions, compilers, pkgName, toSourceFilePath }: PrincipalOptions);
    init(): void;
    addPaths(paths: Paths, basePath: string): void;
    addCompilers(compilers: [SyncCompilers, AsyncCompilers]): void;
    private createProgram;
    private hasAcceptedExtension;
    addEntryPath(filePath: string, options?: {
        skipExportsAnalysis: boolean;
    }): void;
    addEntryPaths(filePaths: Set<string> | string[], options?: {
        skipExportsAnalysis: boolean;
    }): void;
    addProgramPath(filePath: string): void;
    addProjectPath(filePath: string): void;
    deletedFiles: Set<unknown>;
    removeProjectPath(filePath: string): void;
    runAsyncCompilers(): Promise<void>;
    getUsedResolvedFiles(): string[];
    private getProgramSourceFiles;
    getUnreferencedFiles(): string[];
    analyzeSourceFile(filePath: string, options: GetImportsAndExportsOptions, ignoreExportsUsedInFile: IgnoreExportsUsedInFile): FileNode;
    invalidateFile(filePath: string): void;
    findUnusedMembers(filePath: string, members: ExportMember[]): ExportMember[];
    hasExternalReferences(filePath: string, exportedItem: Export): boolean;
    reconcileCache(graph: ModuleGraph): void;
}
