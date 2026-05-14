export { pluginBuildConfig };
export { assertRollupInput };
export { analyzeClientEntries };
import type { ResolvedConfig, Plugin } from 'vite';
import type { PageConfigBuildTime } from '../../../../types/PageConfig.js';
import '../../assertEnvVite.js';
declare function pluginBuildConfig(): Plugin[];
declare function analyzeClientEntries(pageConfigs: PageConfigBuildTime[], config: ResolvedConfig): {
    hasClientRouting: boolean;
    hasServerRouting: boolean;
    clientEntries: Record<string, string>;
};
declare function assertRollupInput(config: ResolvedConfig): void;
