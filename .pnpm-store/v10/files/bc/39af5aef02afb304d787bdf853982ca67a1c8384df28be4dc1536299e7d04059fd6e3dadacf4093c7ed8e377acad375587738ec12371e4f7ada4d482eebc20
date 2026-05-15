export { getVikeConfig };
export type { VikeConfig };
export { getVikeConfigInternal };
export { getVikeConfigInternalOptional };
export { setVikeConfigContext };
export { isVikeConfigContextSet };
export { reloadVikeConfig };
export { isV1Design };
export { getConfVal };
export { getConfigDefinitionOptional };
export { getVikeConfigFromCliOrEnv };
export type { VikeConfigInternal };
export type { PageConfigBuildTimeBeforeComputed };
import type { PageConfigGlobalBuildTime, PageConfigBuildTime } from '../../../types/PageConfig.js';
import { type ConfigDefinitionsInternal, type ConfigDefinitionInternal } from './resolveVikeConfigInternal/metaBuiltIn.js';
import { type GlobalConfigPublic } from '../../../shared-server-client/page-configs/resolveVikeConfigPublic.js';
import { type PlusFile } from './resolveVikeConfigInternal/getPlusFilesByLocationId.js';
import type { PrerenderContextPublic } from '../../prerender/runPrerender.js';
import type { ResolvedConfig, UserConfig } from 'vite';
import { type DangerouslyUseInternals } from '../../../shared-server-client/getPublicProxy.js';
import '../assertEnvVite.js';
type VikeConfigContext = {
    userRootDir: string;
    isDev: boolean;
    vikeVitePluginOptions: unknown;
};
type PrerenderContext = {
    isPrerenderingEnabled: boolean;
    isPrerenderingEnabledForAllPages: boolean;
} & ({
    [K in keyof PrerenderContextPublic]: null;
} | PrerenderContextPublic);
type VikeConfigInternal = GlobalConfigPublic & {
    _pageConfigs: PageConfigBuildTime[];
    _pageConfigGlobal: PageConfigGlobalBuildTime;
    _vikeConfigDependencies: Set<string>;
    _extensions: PlusFile[];
    prerenderContext: PrerenderContext;
};
declare function reloadVikeConfig(): void;
declare function getVikeConfigInternal(doNotRestartViteOnError?: boolean): Promise<VikeConfigInternal>;
/**
 * Get all the information Vike knows about the app in your Vite plugin.
 *
 * https://vike.dev/getVikeConfig
 */
declare function getVikeConfig(
/** @deprecated the `config` argument isn't needed anymore — remove it (it doesn't have any effect) */
_config?: ResolvedConfig | UserConfig): VikeConfig;
type VikeConfig = Pick<VikeConfigInternal, 'config' | 'pages' | 'prerenderContext'> & {
    /** https://vike.dev/warning/internals */
    dangerouslyUseInternals: DangerouslyUseInternals<VikeConfigInternal>;
};
declare function setVikeConfigContext(vikeConfigCtx_: VikeConfigContext): void;
declare function isVikeConfigContextSet(): boolean;
declare function getVikeConfigInternalOptional(): Promise<null | VikeConfigInternal>;
declare function isV1Design(): boolean;
declare function getVikeConfigFromCliOrEnv(): {
    vikeConfigFromCliOrEnv: {
        [x: string]: unknown;
    };
    configFromCliOptions: import("../../cli/parseCli.js").CliOptions | null;
    configFromEnvVar: Record<string, unknown> | null;
};
type PageConfigBuildTimeBeforeComputed = Omit<PageConfigBuildTime, 'configValuesComputed'>;
declare function getConfigDefinitionOptional(configDefinitions: ConfigDefinitionsInternal, configName: string): ConfigDefinitionInternal | null;
declare function getConfVal(plusFile: PlusFile, configName: string): null | {
    value: unknown;
    valueIsLoaded: true;
} | {
    valueIsLoaded: false;
};
