export { handleAssetsManifest };
export { handleAssetsManifest_getBuildConfig };
export { handleAssetsManifest_isFixEnabled };
export { handleAssetsManifest_assertUsageCssCodeSplit };
export { handleAssetsManifest_assertUsageCssTarget };
export { handleAssetsManifest_alignCssTarget };
import type { Environment, ResolvedConfig, Rollup } from 'vite';
import '../../assertEnvVite.js';
type Bundle = Rollup.OutputBundle;
declare function handleAssetsManifest_isFixEnabled(): boolean;
declare function handleAssetsManifest_assertUsageCssCodeSplit(config: ResolvedConfig): void;
declare function handleAssetsManifest_alignCssTarget(config: ResolvedConfig): void;
declare function handleAssetsManifest_assertUsageCssTarget(config: ResolvedConfig, env: Environment): void;
declare function handleAssetsManifest_getBuildConfig(): Promise<{
    readonly ssrEmitAssets: true | undefined;
    readonly cssMinify: "esbuild" | undefined;
    readonly manifest: true;
}>;
declare function handleAssetsManifest(config: ResolvedConfig, viteEnv: Environment, options: {
    dir: string | undefined;
}, bundle: Bundle): Promise<void>;
