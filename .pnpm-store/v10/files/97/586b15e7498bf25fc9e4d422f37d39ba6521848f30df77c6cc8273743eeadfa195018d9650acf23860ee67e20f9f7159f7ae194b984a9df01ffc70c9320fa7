export { getConfigValueBuildTime };
import type { ResolveTypeAsString } from '../../utils/hasProp.js';
import type { PageConfigBuildTime, ConfigValue } from '../../types/PageConfig.js';
import type { ConfigNameBuiltIn } from '../../types/Config.js';
import { type TypeAsString } from './getConfigValueTyped.js';
declare function getConfigValueBuildTime<Type extends TypeAsString = undefined>(pageConfig: PageConfigBuildTime, configName: ConfigNameBuiltIn, type?: Type): null | (ConfigValue & {
    value: ResolveTypeAsString<Type>;
});
