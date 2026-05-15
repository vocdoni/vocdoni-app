import type { IgnoreIssues } from './types/config.js';
import type { ConfigurationHint, Issue, TagHint } from './types/issues.js';
import type { MainOptions } from './util/create-options.js';
import type { WorkspaceFilePathFilter } from './util/workspace-file-filter.js';
export type CollectorIssues = ReturnType<IssueCollector['getIssues']>;
export declare class IssueCollector {
    private cwd;
    private rules;
    private workspaceFilter;
    private issues;
    private counters;
    private referencedFiles;
    private configurationHints;
    private tagHints;
    private ignorePatterns;
    private ignoreFilesPatterns;
    private isMatch;
    private isFileMatch;
    private issueMatchers;
    constructor(options: MainOptions);
    setWorkspaceFilter(workspaceFilePathFilter: WorkspaceFilePathFilter | undefined): void;
    addIgnorePatterns(patterns: string[]): void;
    addIgnoreFilesPatterns(patterns: string[]): void;
    setIgnoreIssues(ignoreIssues?: IgnoreIssues): void;
    private shouldIgnoreIssue;
    addFileCounts({ processed, unused }: {
        processed: number;
        unused: number;
    }): void;
    addFilesIssues(filePaths: string[]): void;
    addIssue(issue: Issue): true | undefined;
    addConfigurationHint(issue: ConfigurationHint): void;
    addTagHint(issue: TagHint): void;
    purge(): import("./types/issues.js").IssueSet;
    getIssues(): {
        issues: import("./types/issues.js").Issues;
        counters: import("./types/issues.js").Counters;
        tagHints: Set<TagHint>;
        configurationHints: ConfigurationHint[];
    };
    private retainedIssues;
    retainIssue(issue: Issue): void;
    getRetainedIssues(): Issue[];
}
