export { execHook };
export { execHookGlobal };
export { execHookList };
export { execHookSingle };
export { execHookSingleSync };
export { execHookSingleWithReturn };
export { execHookSingleWithoutPageContext };
export { getPageContext_sync };
export { providePageContext };
export { isUserHookError };
import { assert, getProjectError, assertWarning, assertUsage } from '../../utils/assert.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { humanizeTime } from '../../utils/humanizeTime.js';
import { isObject } from '../../utils/isObject.js';
import { getHooksFromPageConfigGlobalCumulative, getHooksFromPageContextNew } from './getHook.js';
import { getPageContextPublicShared } from '../getPageContextPublicShared.js';
const globalObject = getGlobalObject('utils/execHook.ts', {
    userHookErrors: new WeakMap(),
    pageContext: null,
});
async function execHook(hookName, pageContext, getPageContextPublic) {
    const hooks = getHooksFromPageContextNew(hookName, pageContext);
    return await execHookList(hooks, pageContext, getPageContextPublic);
}
async function execHookGlobal(hookName, globalContext, getGlobalContextPublic) {
    const hooks = getHooksFromPageConfigGlobalCumulative(globalContext._pageConfigGlobal, hookName);
    const globalContextPublic = getGlobalContextPublic(globalContext);
    await Promise.all(hooks.map(async (hook) => {
        await execHookBaseAsync(() => hook.hookFn(globalContextPublic), hook, globalContext, null);
    }));
}
async function execHookList(hooks, pageContext, getPageContextPublic) {
    if (!hooks.length)
        return [];
    const pageContextPublic = getPageContextPublic(pageContext);
    const hooksWithResult = await Promise.all(hooks.map(async (hook) => {
        const hookReturn = await execHookBaseAsync(() => hook.hookFn(pageContextPublic), hook, pageContext._globalContext, pageContextPublic);
        return { ...hook, hookReturn };
    }));
    return hooksWithResult;
}
async function execHookSingle(hook, pageContext, getPageContextPublic) {
    const hooksWithResult = await execHookList([hook], pageContext, getPageContextPublic);
    const { hookReturn } = hooksWithResult[0];
    assertUsage(hookReturn === undefined, `The ${hook.hookName}() hook defined by ${hook.hookFilePath} isn't allowed to return a value`);
}
async function execHookSingleWithReturn(hook, pageContext, getPageContextPublic) {
    const hooksWithResult = await execHookList([hook], pageContext, getPageContextPublic);
    const { hookReturn } = hooksWithResult[0];
    return { hookReturn };
}
function isUserHookError(err) {
    if (!isObject(err))
        return false;
    return globalObject.userHookErrors.get(err) ?? false;
}
async function execHookSingleWithoutPageContext(hook, globalContext, hookFnCaller) {
    const { hookName, hookFilePath, hookTimeout } = hook;
    const hookReturn = await execHookBaseAsync(hookFnCaller, { hookName, hookFilePath, hookTimeout }, globalContext, null);
    return hookReturn;
}
function execHookSingleSync(hook, globalContext, pageContext, getPageContextPublic, hookFnCaller) {
    const pageContextPublic = pageContext && getPageContextPublic(pageContext);
    hookFnCaller ?? (hookFnCaller = () => hook.hookFn(pageContextPublic));
    const hookReturn = execHookBase(hookFnCaller, hook, globalContext, pageContextPublic);
    return { hookReturn };
}
function execHookBaseAsync(hookFnCaller, hook, globalContext, pageContextPublic) {
    const { hookName, hookFilePath, hookTimeout: { error: timeoutErr, warning: timeoutWarn }, } = hook;
    let resolve;
    let reject;
    const promise = new Promise((resolve_, reject_) => {
        resolve = (ret) => {
            clearTimeouts();
            resolve_(ret);
        };
        reject = (err) => {
            clearTimeouts();
            reject_(err);
        };
    });
    const clearTimeouts = () => {
        if (currentTimeoutWarn)
            clearTimeout(currentTimeoutWarn);
        if (currentTimeoutErr)
            clearTimeout(currentTimeoutErr);
    };
    const currentTimeoutWarn = isNotDisabled(timeoutWarn) &&
        setTimeout(() => {
            assertWarning(false, `The ${hookName}() hook defined by ${hookFilePath} is slow: it's taking more than ${humanizeTime(timeoutWarn)} (https://vike.dev/hooksTimeout)`, { onlyOnce: false });
        }, timeoutWarn);
    const currentTimeoutErr = isNotDisabled(timeoutErr) &&
        setTimeout(() => {
            const err = getProjectError(`The ${hookName}() hook defined by ${hookFilePath} timed out: it didn't finish after ${humanizeTime(timeoutErr)} (https://vike.dev/hooksTimeout)`);
            reject(err);
        }, timeoutErr);
    (async () => {
        try {
            const ret = await execHookBase(hookFnCaller, hook, globalContext, pageContextPublic);
            resolve(ret);
        }
        catch (err) {
            if (isObject(err)) {
                globalObject.userHookErrors.set(err, { hookName, hookFilePath });
            }
            reject(err);
        }
    })();
    return promise;
}
// Every execHook* function should be based on this
function execHookBase(hookFnCaller, hook, globalContext, pageContext) {
    const { hookName, hookFilePath } = hook;
    assert(hookName !== 'onHookCall'); // ensure no infinite loop
    const configValue = globalContext._pageConfigGlobal.configValues['onHookCall'];
    const callOriginal = () => {
        providePageContextInternal(pageContext);
        return hookFnCaller();
    };
    // +onHookCall doesn't exist
    if (!configValue?.value)
        return callOriginal();
    // +onHookCall wrapping
    let originalCalled = false;
    let originalReturn;
    let originalError;
    let call = () => {
        originalCalled = true;
        try {
            originalReturn = callOriginal();
        }
        catch (err) {
            originalError = err;
            throw err;
        }
        return originalReturn;
    };
    for (const onHookCall of configValue.value) {
        // @ts-expect-error
        const hookPublic = { name: hookName, filePath: hookFilePath, call };
        // Recursively wrap callOriginal() so +onHookCall can use async hooks. (E.g. vike-react-sentry integrates Sentry's `Tracer.startActiveSpan()`.)
        call = () => {
            ;
            (async () => {
                try {
                    await onHookCall(hookPublic, pageContext);
                }
                catch (err) {
                    if (err !== originalError) {
                        console.error(err);
                        /* TO-DO/eventually: use dependency injection to be able to use logErrorServer() when this function runs on the server-side.
                        if (
                          !globalThis.__VIKE__IS_CLIENT &&
                          pageContext &&
                          // Avoid infinite loop
                          hookName !== 'onError'
                        ) {
                          assert(!pageContext.isClientSide)
                          logErrorServer(err, pageContext)
                        } else {
                          logErrorClient(err)
                        }
                        //*/
                    }
                }
            })();
            // +onHookCall must run hook.call() before any `await` — https://github.com/vikejs/vike/pull/2978#discussion_r2645232953
            assertUsage(originalCalled, 'onHookCall() must run hook.call()');
            return originalReturn;
        };
    }
    // Start the call() chain
    call();
    if (originalError)
        throw originalError;
    return originalReturn;
}
function isNotDisabled(timeout) {
    return !!timeout && timeout !== Infinity;
}
function getPageContext_sync() {
    const { pageContext } = globalObject;
    if (!pageContext)
        return null;
    const pageContextPublic = pageContext._isProxyObject
        ? // providePageContext() is called on the user-land (e.g. it's called by `vike-{react,vue,solid}`) thus it's already a proxy
            pageContext
        : getPageContextPublicShared(pageContext);
    return pageContextPublic;
}
/**
 * Provide `pageContext` for universal hooks.
 *
 * https://vike.dev/getPageContext
 */
function providePageContext(pageContext) {
    providePageContextInternal(pageContext);
}
function providePageContextInternal(pageContext) {
    globalObject.pageContext = pageContext;
    // Promise.resolve() is quicker than process.nextTick() and setImmediate()
    // https://stackoverflow.com/questions/67949576/process-nexttick-before-promise-resolve-then
    Promise.resolve().then(() => {
        globalObject.pageContext = null;
    });
}
