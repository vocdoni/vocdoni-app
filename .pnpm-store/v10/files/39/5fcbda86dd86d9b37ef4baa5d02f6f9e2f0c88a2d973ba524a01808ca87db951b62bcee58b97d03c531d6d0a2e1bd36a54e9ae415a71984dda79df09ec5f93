export { getPageContext_withAsyncHook };
export { getRequestId_withAsyncHook };
export { getAsyncLocalStorage };
import { getPageContextPublicServer } from './renderPageServer/getPageContextPublicServer.js';
import { assert } from '../../utils/assert.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { isObject } from '../../utils/isObject.js';
import { import_ } from '@brillout/import';
import '../assertEnvServer.js';
const globalObject = getGlobalObject('server/runtime/asyncHook.ts', {
    asyncLocalStorage: null,
    installPromise: install(),
});
async function install() {
    let mod;
    try {
        mod = await import_('node:async_hooks');
    }
    catch {
        return;
    }
    globalObject.asyncLocalStorage = new mod.AsyncLocalStorage();
}
async function getAsyncLocalStorage() {
    await globalObject.installPromise;
    return globalObject.asyncLocalStorage;
}
function getAsyncStore() {
    if (globalObject.asyncLocalStorage === null)
        return null;
    const asyncStore = globalObject.asyncLocalStorage.getStore();
    assert(asyncStore === undefined || isObject(asyncStore));
    return asyncStore ?? null;
}
function getRequestId_withAsyncHook() {
    const asyncStore = getAsyncStore();
    return asyncStore?.requestId ?? null;
}
function getPageContext_withAsyncHook() {
    const asyncStore = getAsyncStore();
    const pageContext = asyncStore?.pageContext;
    if (!pageContext)
        return null;
    return getPageContextPublicServer(pageContext);
}
