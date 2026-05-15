import { ProjectPrincipal } from './ProjectPrincipal.js';
import type { PrincipalOptions } from './types/project.js';
import type { MainOptions } from './util/create-options.js';
export declare class PrincipalFactory {
    private principals;
    getPrincipalCount(): number;
    createPrincipal(options: MainOptions, opts: PrincipalOptions): ProjectPrincipal;
    private findReusablePrincipal;
    private linkPrincipal;
    private addNewPrincipal;
    getPrincipals(): ProjectPrincipal[];
    getPrincipalByPackageName(packageName: string): ProjectPrincipal | undefined;
    deletePrincipal(principal: ProjectPrincipal, cwd: string): void;
}
