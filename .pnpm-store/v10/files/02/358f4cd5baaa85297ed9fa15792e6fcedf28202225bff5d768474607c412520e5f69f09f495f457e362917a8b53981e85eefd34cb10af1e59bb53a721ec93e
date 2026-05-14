import type { ConfigurationChief, Workspace } from '../ConfigurationChief.js';
import type { DependencyDeputy } from '../DependencyDeputy.js';
import type { Issue } from '../types/issues.js';
import type { ExternalRef } from '../types/module-graph.js';
import type { MainOptions } from './create-options.js';
import { type Input } from './input.js';
export type ExternalRefsFromInputs = Map<string, Set<ExternalRef>>;
export declare const createInputHandler: (deputy: DependencyDeputy, chief: ConfigurationChief, isGitIgnored: (filePath: string) => boolean, addIssue: (issue: Issue) => void, externalRefs: ExternalRefsFromInputs | undefined, options: MainOptions) => (input: Input, workspace: Workspace) => string | undefined;
