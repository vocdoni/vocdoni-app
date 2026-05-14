export { objectAssign };
import { assert } from './assert.js';
// Same as Object.assign() but:
//  - With type inference
//  - Preserves property descriptors, which we need for preserving the getters of getPageContextUrlComputed()
function objectAssign(obj, objAddendum, objAddendumCanBeOriginalObject) {
    if (!objAddendum)
        return;
    if (!objAddendumCanBeOriginalObject)
        assert(!objAddendum._isOriginalObject);
    Object.defineProperties(obj, Object.getOwnPropertyDescriptors(objAddendum));
}
