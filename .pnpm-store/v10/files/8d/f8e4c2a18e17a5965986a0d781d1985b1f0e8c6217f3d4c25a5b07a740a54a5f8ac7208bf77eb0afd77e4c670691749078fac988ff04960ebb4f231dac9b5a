export { parsePageConfigsSerialized };
export { parseConfigValuesSerialized };
import type { ConfigValues, PageConfigRuntime, PageConfigGlobalRuntime } from '../../../types/PageConfig.js';
import type { PageConfigGlobalRuntimeSerialized, PageConfigRuntimeSerialized } from './PageConfigSerialized.js';
import type { ConfigValueSerialized } from './PageConfigSerialized.js';
declare function parsePageConfigsSerialized(pageConfigsSerialized: PageConfigRuntimeSerialized[], pageConfigGlobalSerialized: PageConfigGlobalRuntimeSerialized): {
    pageConfigs: PageConfigRuntime[];
    pageConfigGlobal: PageConfigGlobalRuntime;
};
declare function parseConfigValuesSerialized(configValuesSerialized: Record<string, ConfigValueSerialized>): ConfigValues;
