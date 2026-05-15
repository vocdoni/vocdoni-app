// Public usage
export { getGlobalContext };
export { getGlobalContextSync };
export { setVirtualFileExportsGlobalEntry };
// Internal usage
export { getGlobalContextClientInternalShared };
import { createGlobalContextShared, getGlobalContextSyncErrMsg, } from '../../shared-server-client/createGlobalContextShared.js';
import { getGlobalContextSerializedInHtml } from './getJsonSerializedInHtml.js';
import { assert, assertUsage } from '../../utils/assert.js';
import { checkType } from '../../utils/checkType.js';
import { genPromise } from '../../utils/genPromise.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { objectAssign } from '../../utils/objectAssign.js';
import '../assertEnvClient.js';
const globalObject = getGlobalObject('getGlobalContextClientInternalShared.ts', (() => {
    const { promise: globalContextInitialPromise, resolve: globalContextInitialPromiseResolve } = genPromise();
    return {
        globalContextInitialPromise,
        globalContextInitialPromiseResolve,
    };
})());
async function getGlobalContextClientInternalShared() {
    // Get
    if (globalObject.globalContextPromise) {
        const globalContext = await globalObject.globalContextPromise;
        return globalContext;
    }
    // Create
    const globalContextPromise = createGlobalContextShared(globalObject.virtualFileExportsGlobalEntry, globalObject, () => {
        const globalContextAddendum = {
            /**
             * Whether the environment is the client-side:
             * - In the browser, the value is `true`.
             * - Upon SSR and pre-rendering, the value is `false`.
             *
             * https://vike.dev/globalContext#isClientSide
             */
            isClientSide: true,
        };
        objectAssign(globalContextAddendum, getGlobalContextSerializedInHtml());
        return globalContextAddendum;
    });
    globalObject.globalContextPromise = globalContextPromise;
    const globalContext = await globalContextPromise;
    assert(globalObject.globalContext === globalContext);
    globalObject.globalContextInitialPromiseResolve();
    // Return
    return globalContext;
}
async function getGlobalContext() {
    await globalObject.globalContextInitialPromise;
    const globalContext = await globalObject.globalContextPromise;
    assert(globalContext);
    checkType(globalContext);
    return globalContext;
}
function getGlobalContextSync() {
    const { globalContext } = globalObject;
    assertUsage(globalContext, getGlobalContextSyncErrMsg);
    checkType(globalContext);
    return globalContext;
}
async function setVirtualFileExportsGlobalEntry(virtualFileExportsGlobalEntry) {
    // HMR => virtualFileExportsGlobalEntry differ
    if (globalObject.virtualFileExportsGlobalEntry !== virtualFileExportsGlobalEntry) {
        delete globalObject.globalContextPromise;
        globalObject.virtualFileExportsGlobalEntry = virtualFileExportsGlobalEntry;
        // Eagerly call +onCreateGlobalContext() hooks
        await getGlobalContextClientInternalShared();
    }
}
