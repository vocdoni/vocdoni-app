export { getViteConfigRuntime };
export type { ViteConfigRuntime };
import type { ResolvedConfig } from 'vite';
import '../assertEnvVite.js';
type ViteConfigRuntime = ReturnType<typeof getViteConfigRuntime>;
declare function getViteConfigRuntime(config: ResolvedConfig): {
    root: string;
    build: {
        outDir: string;
    };
    _baseViteOriginal: string;
    vitePluginServerEntry: {
        inject: boolean | undefined;
    };
};
