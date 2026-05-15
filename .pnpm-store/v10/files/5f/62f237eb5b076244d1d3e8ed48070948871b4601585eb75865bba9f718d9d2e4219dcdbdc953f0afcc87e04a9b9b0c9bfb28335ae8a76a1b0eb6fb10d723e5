import type { WatchListener } from 'node:fs';
import type { ConfigurationChief } from '../ConfigurationChief.js';
import type { IssueCollector } from '../IssueCollector.js';
import type { PrincipalFactory } from '../PrincipalFactory.js';
import type { ProjectPrincipal } from '../ProjectPrincipal.js';
import type { Issues } from '../types/issues.js';
import type { ModuleGraph } from '../types/module-graph.js';
import type { MainOptions } from './create-options.js';
export type OnFileChange = (options: {
    issues: Issues;
    duration?: number;
    mem?: number;
}) => void;
export type WatchChange = {
    type: 'added' | 'deleted' | 'modified';
    filePath: string;
};
export type SessionHandler = Awaited<ReturnType<typeof getSessionHandler>>;
type WatchOptions = {
    analyzedFiles: Set<string>;
    analyzeSourceFile: (filePath: string, principal: ProjectPrincipal) => void;
    chief: ConfigurationChief;
    collector: IssueCollector;
    analyze: () => Promise<void>;
    factory: PrincipalFactory;
    graph: ModuleGraph;
    isIgnored: (path: string) => boolean;
    onFileChange?: OnFileChange;
    unreferencedFiles: Set<string>;
    entryPaths: Set<string>;
};
export declare const getSessionHandler: (options: MainOptions, { analyzedFiles, analyzeSourceFile, chief, collector, analyze, factory, graph, isIgnored, onFileChange, unreferencedFiles, entryPaths, }: WatchOptions) => Promise<{
    listener: WatchListener<string | Buffer<ArrayBufferLike>>;
    handleFileChanges: (changes: WatchChange[]) => Promise<{
        duration: number;
        mem: number;
    }>;
    getEntryPaths: () => Set<string>;
    getGraph: () => ModuleGraph;
    getIssues: () => {
        issues: Issues;
        counters: import("../types/issues.js").Counters;
        tagHints: Set<import("../types/issues.js").TagHint>;
        configurationHints: import("../types/issues.js").ConfigurationHint[];
    };
}>;
export {};
