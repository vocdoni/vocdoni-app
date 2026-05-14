/**
 * Resolves the correct tsconfig file for a given source file.
 *
 * Handles solution-style tsconfigs (e.g. Vite projects) where the root
 * tsconfig.json has `"files": []` and `"references": [...]`, and the
 * actual compiler options (like `paths`) live in a referenced config.
 */
export declare function resolveTsconfig(sourceFile: string, tsconfigPath?: string): Promise<string | undefined>;
