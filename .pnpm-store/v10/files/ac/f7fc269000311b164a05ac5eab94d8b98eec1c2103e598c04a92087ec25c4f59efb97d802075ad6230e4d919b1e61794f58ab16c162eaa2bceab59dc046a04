import type { ModuleGraph } from '../types/module-graph.js';
export declare const createGraphExplorer: (graph: ModuleGraph, entryPaths: Set<string>) => {
    isReferenced: (filePath: string, identifier: string, options: {
        includeEntryExports: boolean;
    }) => [boolean, string | undefined];
    hasStrictlyNsReferences: (filePath: string, identifier: string) => [boolean, (string | undefined)?];
    buildExportsTree: (options: {
        filePath?: string;
        identifier?: string;
    }) => import("./operations/build-exports-tree.js").ExportsTreeNode[];
    getDependencyUsage: (pattern?: string | RegExp) => Map<string, import("./operations/get-dependency-usage.js").DependencyNodes>;
    resolveDefinition: (filePath: string, identifier: string) => import("./operations/resolve-definition.js").DefinitionResult | null;
    getUsage: (filePath: string, identifier: string) => import("./operations/get-usage.js").UsageResult;
    findCycles: (filePath: string, maxDepth?: number) => import("../session/types.js").Cycle[];
    getContention: (filePath: string) => Map<string, import("../session/types.js").ContentionDetails>;
    invalidateCache: () => void;
};
export type GraphExplorer = ReturnType<typeof createGraphExplorer>;
