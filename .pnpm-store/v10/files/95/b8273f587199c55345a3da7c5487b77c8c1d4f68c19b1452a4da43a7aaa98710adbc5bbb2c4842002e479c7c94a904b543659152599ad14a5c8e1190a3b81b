export { getConfigValueRuntime };
import { getConfigValueTyped } from './getConfigValueTyped.js';
function getConfigValueRuntime(pageConfig, configName, type) {
    const configValue = pageConfig.configValues[configName];
    if (!configValue)
        return null;
    return getConfigValueTyped(configValue, configName, type);
}
