import { ConsoleStreamer } from './ConsoleStreamer.js';
import type { MainOptions } from './util/create-options.js';
export type Results = Awaited<ReturnType<typeof run>>['results'];
export declare const run: (options: MainOptions) => Promise<{
    results: {
        issues: import("./types/issues.js").Issues;
        counters: import("./types/issues.js").Counters;
        tagHints: Set<import("./types/issues.js").TagHint>;
        configurationHints: import("./types/issues.js").ConfigurationHint[];
        selectedWorkspaces: string[] | undefined;
        includedWorkspaceDirs: string[];
        enabledPlugins: {
            [k: string]: string[];
        };
    };
    session: {
        listener: import("fs").WatchListener<string | Buffer<ArrayBufferLike>>;
        handleFileChanges: (changes: import("./util/watch.js").WatchChange[]) => Promise<{
            duration: number;
            mem: number;
        }>;
        getEntryPaths: () => Set<string>;
        getGraph: () => import("./types/module-graph.js").ModuleGraph;
        getIssues: () => {
            issues: import("./types/issues.js").Issues;
            counters: import("./types/issues.js").Counters;
            tagHints: Set<import("./types/issues.js").TagHint>;
            configurationHints: import("./types/issues.js").ConfigurationHint[];
        };
    } | undefined;
    streamer: ConsoleStreamer;
}>;
