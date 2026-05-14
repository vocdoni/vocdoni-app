export { getConfigValueSourcesRelevant };
export { getConfigValueSourceRelevantAnyEnv };
export { isRuntimeEnvMatch };
export { isConfigSourceValueNull };
export type { RuntimeEnv };
import type { ConfigEnvInternal, ConfigValueSource, PageConfigBuildTime, PageConfigGlobalBuildTime } from '../../../../types/PageConfig.js';
import '../../assertEnvVite.js';
type RuntimeEnv = {
    isForClientSide: boolean;
    isClientRouting: boolean;
    isDev?: boolean;
} | {
    isForConfig: true;
};
type PageConfigPartial = Pick<PageConfigBuildTime | PageConfigGlobalBuildTime, 'configValueSources' | 'configDefinitions'>;
declare function getConfigValueSourcesRelevant(configName: string, runtimeEnv: RuntimeEnv, pageConfig: PageConfigPartial): ConfigValueSource[];
declare function getConfigValueSourceRelevantAnyEnv(configName: string, pageConfig: PageConfigPartial): null | ConfigValueSource;
declare function isRuntimeEnvMatch(configEnv: ConfigEnvInternal, runtimeEnv: RuntimeEnv): boolean;
declare function isConfigSourceValueNull(source: ConfigValueSource): boolean | null;
