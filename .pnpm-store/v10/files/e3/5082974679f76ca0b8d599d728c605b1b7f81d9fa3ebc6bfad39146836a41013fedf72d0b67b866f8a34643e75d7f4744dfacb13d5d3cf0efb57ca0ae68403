export { isObjectOfStrings };
import { isObject } from './isObject.js';
function isObjectOfStrings(val) {
    return isObject(val) && Object.values(val).every((v) => typeof v === 'string');
}
