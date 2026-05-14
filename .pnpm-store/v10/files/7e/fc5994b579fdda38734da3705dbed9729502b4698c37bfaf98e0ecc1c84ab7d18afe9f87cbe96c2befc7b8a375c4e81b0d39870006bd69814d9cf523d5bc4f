export { getConfigValueRuntime };
import type { ResolveTypeAsString } from '../../utils/hasProp.js';
import type { PageConfigRuntime, ConfigValue } from '../../types/PageConfig.js';
import type { ConfigNameBuiltIn } from '../../types/Config.js';
import { type TypeAsString } from './getConfigValueTyped.js';
declare function getConfigValueRuntime<Type extends TypeAsString = undefined>(pageConfig: PageConfigRuntime, configName: ConfigNameBuiltIn, type?: Type): null | (ConfigValue & {
    value: ResolveTypeAsString<Type>;
});
