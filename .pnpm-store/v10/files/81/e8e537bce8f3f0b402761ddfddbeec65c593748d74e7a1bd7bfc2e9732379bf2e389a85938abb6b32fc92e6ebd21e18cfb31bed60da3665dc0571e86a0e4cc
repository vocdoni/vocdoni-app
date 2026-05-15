export { isViteCli };
export { getViteConfigForBuildFromCli };
export { getViteCommandFromCli };
import '../assertEnvVite.js';
declare function isViteCli(): boolean;
type ConfigFromCli = {
    root: undefined | string;
    configFile: undefined | string;
} & Record<string, unknown> & {
    build: Record<string, unknown>;
};
type ViteCommand = 'dev' | 'build' | 'optimize' | 'preview';
declare function getViteCommandFromCli(): ViteCommand | null;
declare function getViteConfigForBuildFromCli(): null | ConfigFromCli;
