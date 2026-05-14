import type { CatalogCounselor } from '../CatalogCounselor.js';
import type { ConfigurationChief, Workspace } from '../ConfigurationChief.js';
import type { ConsoleStreamer } from '../ConsoleStreamer.js';
import type { DependencyDeputy } from '../DependencyDeputy.js';
import type { IssueCollector } from '../IssueCollector.js';
import type { PrincipalFactory } from '../PrincipalFactory.js';
import type { ProjectPrincipal } from '../ProjectPrincipal.js';
import type { ModuleGraph } from '../types/module-graph.js';
import type { MainOptions } from '../util/create-options.js';
interface BuildOptions {
    chief: ConfigurationChief;
    collector: IssueCollector;
    counselor: CatalogCounselor;
    deputy: DependencyDeputy;
    factory: PrincipalFactory;
    isGitIgnored: (path: string) => boolean;
    streamer: ConsoleStreamer;
    workspaces: Workspace[];
    options: MainOptions;
}
export declare function build({ chief, collector, counselor, deputy, factory, isGitIgnored, streamer, workspaces, options, }: BuildOptions): Promise<{
    graph: ModuleGraph;
    entryPaths: Set<string>;
    analyzedFiles: Set<string>;
    unreferencedFiles: Set<string>;
    analyzeSourceFile: (filePath: string, principal: ProjectPrincipal) => void;
    enabledPluginsStore: Map<string, string[]>;
}>;
export {};
