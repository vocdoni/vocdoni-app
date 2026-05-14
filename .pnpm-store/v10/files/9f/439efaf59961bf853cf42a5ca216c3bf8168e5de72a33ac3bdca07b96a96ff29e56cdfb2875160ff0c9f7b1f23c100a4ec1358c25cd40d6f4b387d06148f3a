import ts from 'typescript';
import type { GetImportsAndExportsOptions, IgnoreExportsUsedInFile } from '../types/config.js';
import type { Export, ExportMember, FileNode } from '../types/module-graph.js';
import type { BoundSourceFile } from './SourceFile.js';
export type ExportWithSymbol = Export & {
    symbol: ts.Symbol | undefined;
    members: MemberWithSymbol[];
};
export type MemberWithSymbol = ExportMember & {
    symbol: ts.Symbol | undefined;
};
export declare const _getImportsAndExports: (sourceFile: BoundSourceFile, resolveModule: (specifier: string) => ts.ResolvedModuleFull | undefined, typeChecker: ts.TypeChecker, options: GetImportsAndExportsOptions, ignoreExportsUsedInFile: IgnoreExportsUsedInFile, skipExportsForFile: boolean) => FileNode;
