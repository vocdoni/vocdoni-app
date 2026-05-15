export { getPropVal };
export { setPropVal };
export { getPropKeys };
import { isObject } from '../../../../utils/isObject.js';
import '../../../assertEnvServer.js';
// Get a nested property from an object using a dot-separated path such as 'user.id'
function getPropVal(obj, prop) {
    const keys = getPropKeys(prop);
    let value = obj;
    for (const key of keys) {
        if (isObject(value) && key in value) {
            value = value[key];
        }
        else {
            return null; // Property or intermediate property doesn't exist
        }
    }
    return { value };
}
// Set a nested property in an object using a dot-separated path such as 'user.id'
function setPropVal(obj, prop, val) {
    const keys = getPropKeys(prop);
    let currentObj = obj;
    // Creating intermediate objects if necessary
    for (let i = 0; i <= keys.length - 2; i++) {
        const key = keys[i];
        if (!(key in currentObj)) {
            // Create intermediate object
            currentObj[key] = {};
        }
        if (!isObject(currentObj[key])) {
            // Skip value upon data structure conflict
            return;
        }
        currentObj = currentObj[key];
    }
    // Set the final key to the value
    const finalKey = keys[keys.length - 1];
    currentObj[finalKey] = val;
}
function getPropKeys(prop) {
    // Like `prop.split('.')` but with added support for `\` escaping, see getPageContextClientSerialized.spec.ts
    return prop
        .split(/(?<!\\)\./) // Split on unescaped dots
        .map((key) => key.replace(/\\\./g, '.')); // Replace escaped dots with literal dots
}
