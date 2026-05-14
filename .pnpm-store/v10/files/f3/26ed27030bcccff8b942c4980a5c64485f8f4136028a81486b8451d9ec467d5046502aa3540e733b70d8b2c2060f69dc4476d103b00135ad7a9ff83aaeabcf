export { getGlobalContextPublicShared };
import { getPublicProxy } from './getPublicProxy.js';
import { assert } from '../utils/assert.js';
function getGlobalContextPublicShared(globalContext) {
    assert(globalContext._isOriginalObject); // ensure we preserve the original object reference
    const globalContextPublic = getPublicProxy(globalContext, 'globalContext');
    return globalContextPublic;
}
