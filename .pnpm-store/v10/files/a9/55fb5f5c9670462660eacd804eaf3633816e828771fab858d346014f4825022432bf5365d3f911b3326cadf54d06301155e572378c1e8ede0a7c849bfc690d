export interface ProjectScope {
    framework: "next" | "remix" | "vite" | null;
    componentsDir: string;
}
export interface ProjectContext {
    isTypeScript: boolean;
    cwd: string;
    scope: ProjectScope;
}
export interface ProjectContextOptions {
    cwd?: string;
    tsx?: boolean;
}
export declare function getProjectContext(opts: ProjectContextOptions): Promise<{
    isTypeScript: boolean;
    cwd: string;
    scope: ProjectScope;
}>;
