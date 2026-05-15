export { serializeConfigValues };
export { getConfigValuesBase };
export { isJsonValue };
export type { FilesEnv };
import type { ConfigEnvInternal, ConfigValueSource, DefinedAt, PageConfigBuildTime, PageConfigGlobalBuildTime } from '../../../types/PageConfig.js';
import { type RuntimeEnv } from '../../../node/vite/plugins/pluginVirtualFiles/getConfigValueSourcesRelevant.js';
declare function serializeConfigValues(pageConfig: PageConfigBuildTime | PageConfigGlobalBuildTime, importStatements: string[], filesEnv: FilesEnv, runtimeEnv: RuntimeEnv, tabspace: string, isEager: boolean | null): string[];
declare function isJsonValue(value: unknown): boolean;
declare function getConfigValuesBase(pageConfig: PageConfigBuildTime | PageConfigGlobalBuildTime, runtimeEnv: RuntimeEnv, isEager: boolean | null): ConfigValuesBase;
type ConfigValuesBase = ({
    configValueBase: {
        type: 'computed';
        definedAtData: null;
    };
    value: unknown;
    configEnv: ConfigEnvInternal;
    configName: string;
} | {
    configValueBase: {
        type: 'standard';
        definedAtData: DefinedAt;
    };
    sourceRelevant: ConfigValueSource;
    configName: string;
} | {
    configValueBase: {
        type: 'cumulative';
        definedAtData: DefinedAt[];
    };
    sourcesRelevant: ConfigValueSource[];
    configName: string;
})[];
type FilesEnv = Map<string, {
    configEnv: ConfigEnvInternal;
    configName: string;
}[]>;
