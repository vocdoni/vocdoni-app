export { optimizeDeps };
export { resolveOptimizeDeps };
import type { ResolvedConfig } from 'vite';
import '../../assertEnvVite.js';
declare const optimizeDeps: {
    readonly optimizeDeps: {
        readonly exclude: ["vike/client", "vike/client/router"];
        readonly include: ["vike > @brillout/json-serializer/parse", "vike > @brillout/json-serializer/stringify", "vike > @brillout/picocolors"];
    };
    readonly ssr: {
        readonly optimizeDeps: {
            readonly exclude: ["@brillout/import", "@brillout/json-serializer", "@brillout/vite-plugin-server-entry", "vike"];
        };
    };
};
declare function resolveOptimizeDeps(config: ResolvedConfig): Promise<void>;
