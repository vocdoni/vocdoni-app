export { createGlobalContextShared };
export { getGlobalContextSyncErrMsg };
import { assert } from '../utils/assert.js';
import { objectReplace } from '../utils/objectReplace.js';
import { changeEnumerable } from '../utils/changeEnumerable.js';
import { genPromise } from '../utils/genPromise.js';
import { objectAssign } from '../utils/objectAssign.js';
import { unique } from '../utils/unique.js';
import { parseVirtualFileExportsGlobalEntry } from './getPageFiles/parseVirtualFileExportsGlobalEntry.js';
import { resolveGlobalContextConfig } from './page-configs/resolveVikeConfigPublic.js';
import { execHookGlobal } from './hooks/execHook.js';
import { getGlobalContextPublicShared } from './getGlobalContextPublicShared.js';
import { getHooksFromPageConfigGlobalCumulative } from './hooks/getHook.js';
const getGlobalContextSyncErrMsg = "The global context isn't set yet, call getGlobalContextSync() later or use getGlobalContext() instead.";
// TO-DO/eventually use flat globalContext — like flat pageContext
async function createGlobalContextShared(virtualFileExportsGlobalEntry, globalObject, addGlobalContext, 
// TO-DO/next-major-release: we'll be able to remove addGlobalContextTmp after loadPageRoutes() is sync (it will be sync after we remove the old design)
addGlobalContextTmp, addGlobalContextAsync) {
    const { previousCreateGlobalContextPromise } = globalObject;
    const { promise, resolve } = genPromise({
        // Avoid this Cloudflare Worker error:
        // ```console
        // Error: Disallowed operation called within global scope. Asynchronous I/O (ex: fetch() or connect()), setting a timeout, and generating random values are not allowed within global scope. To fix this error, perform this operation within a handler.
        // ```
        timeout: null,
    });
    globalObject.previousCreateGlobalContextPromise = promise;
    if (previousCreateGlobalContextPromise) {
        assert(globalObject.globalContext);
        await previousCreateGlobalContextPromise;
    }
    try {
        const globalContext = createGlobalContextBase(virtualFileExportsGlobalEntry);
        let isNewGlobalContext;
        if (!globalObject.globalContext) {
            // We set globalObject.globalContext early and before any async operations, so that getGlobalContextSync() can be used early.
            // - Required by vike-vercel
            globalObject.globalContext = globalContext;
            isNewGlobalContext = false;
        }
        else {
            isNewGlobalContext = true;
        }
        if (addGlobalContext &&
            // TO-DO/next-major-release: remove
            globalContext._pageConfigs.length > 0) {
            const globalContextAdded = addGlobalContext?.(globalContext);
            objectAssign(globalContext, globalContextAdded);
        }
        else {
            const globalContextAdded = await addGlobalContextTmp?.(globalContext);
            objectAssign(globalContext, globalContextAdded);
        }
        {
            const globalContextAddedAsync = await addGlobalContextAsync?.(globalContext);
            objectAssign(globalContext, globalContextAddedAsync);
        }
        const onCreateGlobalContextHooks = getHooksFromPageConfigGlobalCumulative(globalContext._pageConfigGlobal, 'onCreateGlobalContext');
        let hooksCalled = false;
        if (!hooksAreEqual(globalObject.onCreateGlobalContextHooks ?? [], onCreateGlobalContextHooks)) {
            globalObject.onCreateGlobalContextHooks = onCreateGlobalContextHooks;
            await execHookGlobal('onCreateGlobalContext', globalContext, getGlobalContextPublicShared);
            hooksCalled = true;
        }
        if (isNewGlobalContext) {
            // Singleton: ensure all `globalContext` user-land references are preserved & updated.
            if (hooksCalled) {
                objectReplace(globalObject.globalContext, globalContext);
            }
            else {
                // We don't use objectReplace() in order to keep user-land properties.
                objectAssign(globalObject.globalContext, globalContext, true);
            }
        }
        return globalObject.globalContext;
    }
    finally {
        resolve();
    }
}
function createGlobalContextBase(virtualFileExportsGlobalEntry) {
    const { pageFilesAll, pageConfigs, pageConfigGlobal } = parseVirtualFileExportsGlobalEntry(virtualFileExportsGlobalEntry);
    const allPageIds = getAllPageIds(pageFilesAll, pageConfigs);
    const globalContextAddendum = resolveGlobalContextConfig(pageConfigs, pageConfigGlobal);
    const globalContext = {
        /**
         * Useful for distinguishing `globalContext` from other objects and narrowing down TypeScript unions.
         *
         * https://vike.dev/globalContext#typescript
         */
        isGlobalContext: true,
        _isOriginalObject: true,
        _virtualFileExportsGlobalEntry: virtualFileExportsGlobalEntry,
        _pageFilesAll: pageFilesAll,
        _pageConfigs: pageConfigs,
        _pageConfigGlobal: pageConfigGlobal,
        _allPageIds: allPageIds,
        ...globalContextAddendum,
    };
    changeEnumerable(globalContext, '_isOriginalObject', false);
    return globalContext;
}
function getAllPageIds(pageFilesAll, pageConfigs) {
    const fileIds = pageFilesAll.filter(({ isDefaultPageFile }) => !isDefaultPageFile).map(({ pageId }) => pageId);
    const allPageIds = unique(fileIds);
    const allPageIds2 = pageConfigs.map((p) => p.pageId);
    return [...allPageIds, ...allPageIds2];
}
function hooksAreEqual(hooks1, hooks2) {
    const hooksFn1 = hooks1.map((hook) => hook.hookFn);
    const hooksFn2 = hooks2.map((hook) => hook.hookFn);
    return (hooksFn1.every((hook) => hooksFn2.includes(hook)) &&
        //
        hooksFn2.every((hook) => hooksFn1.includes(hook)));
}
