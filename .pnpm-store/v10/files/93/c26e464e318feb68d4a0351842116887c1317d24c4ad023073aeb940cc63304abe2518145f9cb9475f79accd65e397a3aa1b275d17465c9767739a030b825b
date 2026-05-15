export { getConfigValueTyped };
import { assert, assertUsage } from '../../utils/assert.js';
import { getValuePrintable } from '../../utils/getValuePrintable.js';
import pc from '@brillout/picocolors';
import { getConfigDefinedAtOptional } from './getConfigDefinedAt.js';
function getConfigValueTyped(configValue, configName, type) {
    /* [NULL_HANDLING] Do we really need this? This doesn't seem to make sense, let's eventually (re)move this.
    // Enable users to suppress global config values by setting the local config value to null
    if (configValue.value === null) return null
    */
    const { value, definedAtData } = configValue;
    if (type)
        assertConfigValueType(value, type, configName, definedAtData);
    return configValue;
}
function assertConfigValueType(value, type, configName, definedAtData) {
    assert(value !== null);
    const typeActual = typeof value;
    if (typeActual === type)
        return;
    const valuePrintable = getValuePrintable(value);
    const problem = valuePrintable !== null
        ? `value ${pc.cyan(valuePrintable)}`
        : `type ${pc.cyan(typeActual)}`;
    const configDefinedAt = getConfigDefinedAtOptional('Config', configName, definedAtData);
    const errMsg = `${configDefinedAt} has an invalid ${problem}: it should be a ${pc.cyan(type)} instead`;
    assertUsage(false, errMsg);
}
