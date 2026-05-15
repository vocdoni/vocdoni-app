export { hasProp };
import { isCallable } from './isCallable.js';
import { isObject } from './isObject.js';
import { isArrayOfStrings } from './isArrayOfStrings.js';
import { isObjectOfStrings } from './isObjectOfStrings.js';
import { isArray } from './isArray.js';
function hasProp(obj, prop, type) {
    if (!isObject(obj))
        return false;
    if (!(prop in obj)) {
        return type === 'undefined';
    }
    if (type === undefined) {
        return true;
    }
    const propValue = obj[prop];
    if (type === 'undefined') {
        return propValue === undefined;
    }
    if (type === 'array') {
        return isArray(propValue);
    }
    if (type === 'object') {
        return isObject(propValue);
    }
    if (type === 'string[]') {
        return isArrayOfStrings(propValue);
    }
    if (type === 'string{}') {
        return isObjectOfStrings(propValue);
    }
    if (type === 'function') {
        return isCallable(propValue);
    }
    if (isArray(type)) {
        return typeof propValue === 'string' && type.includes(propValue);
    }
    if (type === 'null') {
        return propValue === null;
    }
    if (type === 'true') {
        return propValue === true;
    }
    if (type === 'false') {
        return propValue === false;
    }
    return typeof propValue === type;
}
