export { preservePropertyGetters };
import { assert } from './assert.js';
function preservePropertyGetters(objOriginal) {
    // Store original getter descriptors
    const getters = Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(objOriginal)).filter(([_, desc]) => 'get' in desc));
    // Make getters non-enumerable
    for (const [key, desc] of Object.entries(getters)) {
        Object.defineProperty(objOriginal, key, { ...desc, enumerable: false });
    }
    const restorePropertyGetters = function () {
        const objCopy = this;
        delete objOriginal._restorePropertyGetters;
        delete objCopy._restorePropertyGetters;
        for (const [key, desc] of Object.entries(getters)) {
            if (objCopy !== objOriginal) {
                assert(!(key in objCopy));
                Object.defineProperty(objCopy, key, desc); // Add property getters to copy
            }
            assert(key in objOriginal);
            Object.defineProperty(objOriginal, key, desc); // Restore original `enumerable` value
        }
    };
    Object.defineProperty(objOriginal, '_restorePropertyGetters', {
        value: restorePropertyGetters,
        enumerable: true,
        configurable: true,
    });
}
