export { getEnvVarObject };
export { parseJson5 };
import pc from '@brillout/picocolors';
import { assertUsage } from '../../../utils/assert.js';
import { isObject } from '../../../utils/isObject.js';
import JSON5 from 'json5';
import '../assertEnvVite.js';
function getEnvVarObject(envVarName) {
    const valueStr = process.env[envVarName];
    if (!valueStr)
        return null;
    const value = parseJson5(valueStr, envVarName);
    assertUsage(value, `${envVarName} should define an object but it's ${pc.bold(String(value))} instead.`);
    assertUsage(isObject(value), `${envVarName} should define an object but it's set to the following which isn't an object: ${pc.bold(valueStr)}`);
    return value;
}
function parseJson5(valueStr, what) {
    let value;
    try {
        value = JSON5.parse(valueStr);
    }
    catch (err) {
        if (isNotJavaScriptLike(valueStr)) {
            // Interpret as string
            return valueStr;
        }
        console.error(err);
        assertUsage(false, `Cannot parse ${pc.cyan(what)} (see error above) because it's set to the following which isn't a valid JSON5 string: ${pc.bold(valueStr)}`);
    }
    return value;
}
function isNotJavaScriptLike(valueStr) {
    return ![':', ',', '{', '}', '(', ')'].some((c) => valueStr.includes(c));
}
