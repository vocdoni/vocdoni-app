import type { DependencyNodes } from '../graph-explorer/operations/get-dependency-usage.js';
import type { ModuleGraph } from '../types/module-graph.js';
export interface PackageJsonFile {
    dependenciesUsage: Map<string, DependencyNodes>;
}
export declare const buildPackageJsonDescriptor: (graph: ModuleGraph, entryPaths: Set<string>) => PackageJsonFile;
