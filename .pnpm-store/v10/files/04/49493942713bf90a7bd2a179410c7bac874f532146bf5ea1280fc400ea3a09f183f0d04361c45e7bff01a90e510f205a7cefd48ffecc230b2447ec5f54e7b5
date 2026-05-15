export { createDebug };
export { isDebug };
export { isDebugError };
export { debug };
declare const flags: ["vike", "vike:config", "vike:crawl", "vike:file-change", "vike:error", "vike:esbuild-resolve", "vike:pluginExtractAssets", "vike:pluginExtractExportNames", "vike:glob", "vike:globalContext", "vike:log", "vike:optimizeDeps", "vike:outDir", "vike:pageFiles", "vike:pointer-imports", "vike:requireResolve", "vike:routing", "vike:setup", "vike:staticReplace", "vike:stream", "vike:virtualFiles", "vike:vite-rpc"];
type Flag = (typeof flags)[number];
type Options = {
    serialization?: {
        emptyArray?: string;
    };
};
declare function createDebug(flag: Flag, optionsGlobal?: Options): ((...msgs: unknown[]) => void) & {
    options: (optionsLocal: Options) => (...msgs: unknown[]) => void;
    isActivated: boolean;
};
declare function debug(flag: Flag, ...msgs: unknown[]): void;
declare function isDebug(flag?: Flag): boolean;
declare function isDebugError(): boolean;
