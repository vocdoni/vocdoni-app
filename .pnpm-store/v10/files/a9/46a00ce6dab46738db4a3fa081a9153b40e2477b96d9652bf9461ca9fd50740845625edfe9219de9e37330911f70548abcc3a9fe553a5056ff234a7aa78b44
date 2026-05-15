export { getConfigValueTyped };
export type { TypeAsString };
import type { ResolveTypeAsString } from '../../utils/hasProp.js';
import type { ConfigValue } from '../../types/PageConfig.js';
import type { ConfigNameBuiltIn } from '../../types/Config.js';
type TypeAsString = 'string' | 'boolean' | undefined;
declare function getConfigValueTyped<Type extends TypeAsString = undefined>(configValue: ConfigValue, configName: ConfigNameBuiltIn, type?: Type): null | (ConfigValue & {
    value: ResolveTypeAsString<Type>;
});
