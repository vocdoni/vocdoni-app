import type { ModuleGraph } from '../types/module-graph.js';
import { RE_EXPORT_KIND } from './constants.js';
type ReExportKind = (typeof RE_EXPORT_KIND)[keyof typeof RE_EXPORT_KIND];
type Visitor = (filePath: string, identifier: string, via: ReExportKind) => 'continue' | 'stop' | undefined;
export declare const walkUp: (graph: ModuleGraph, filePath: string, identifier: string, visitor: Visitor, visited?: Set<string>) => boolean;
export {};
