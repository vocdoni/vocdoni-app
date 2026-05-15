export { execHookOnRenderHtml };
import { isDocumentHtml, renderDocumentHtml, dangerouslySkipEscape, } from './html/renderHtml.js';
import { getHookFromPageContext } from '../../../shared-server-client/hooks/getHook.js';
import { isPromise } from '../../../utils/isPromise.js';
import { isCallable } from '../../../utils/isCallable.js';
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { isObject } from '../../../utils/isObject.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { isStream } from './html/stream.js';
import { assertPageContextProvidedByUser } from '../../../shared-server-client/assertPageContextProvidedByUser.js';
import { getPageContextPublicServer } from './getPageContextPublicServer.js';
import { assertHookReturnedObject } from '../../../shared-server-client/assertHookReturnedObject.js';
import { logRuntimeError } from '../loggerRuntime.js';
import pc from '@brillout/picocolors';
import { execHookSingleWithReturn } from '../../../shared-server-client/hooks/execHook.js';
import '../../assertEnvServer.js';
async function execHookOnRenderHtml(pageContext) {
    const hook = getRenderHook(pageContext);
    objectAssign(pageContext, { _renderHook: hook });
    const { hookReturn } = await execHookSingleWithReturn(hook, pageContext, getPageContextPublicServer);
    const { documentHtml, pageContextProvidedByRenderHook, pageContextPromise, injectFilter } = processHookReturnValue(hookReturn, hook);
    Object.assign(pageContext, pageContextProvidedByRenderHook);
    objectAssign(pageContext, { _pageContextPromise: pageContextPromise });
    const onErrorWhileStreaming = (err) => {
        // Should the stream inject the following?
        // ```
        // <script>console.error("An error occurred on the server side while streaming the page to HTML, see server logs.")</script>
        // ```
        logRuntimeError(err, pageContext);
        if (!pageContext.errorWhileRendering) {
            pageContext.errorWhileRendering = err;
        }
    };
    const htmlRender = await renderDocumentHtml(documentHtml, pageContext, onErrorWhileStreaming, injectFilter);
    assert(typeof htmlRender === 'string' || isStream(htmlRender));
    return { htmlRender, renderHook: hook };
}
function getRenderHook(pageContext) {
    let hookFound;
    {
        let hook;
        let hookName = undefined;
        hook = getHookFromPageContext(pageContext, 'onRenderHtml');
        if (hook) {
            hookName = 'onRenderHtml';
        }
        else {
            hook = getHookFromPageContext(pageContext, 'render');
            if (hook) {
                hookName = 'render';
            }
        }
        if (hook) {
            assert(hookName);
            const { hookFilePath, hookFn, hookTimeout } = hook;
            hookFound = { hookFn, hookFilePath, hookName, hookTimeout };
        }
    }
    if (!hookFound) {
        const hookName = pageContext._globalContext._pageConfigs.length > 0 ? 'onRenderHtml' : 'render';
        assertUsage(false, `No ${hookName}() hook found, see https://vike.dev/${hookName}`);
    }
    return hookFound;
}
function processHookReturnValue(hookReturnValue, renderHook) {
    let documentHtml;
    let pageContextPromise = null;
    let pageContextProvidedByRenderHook = null;
    let injectFilter = null;
    if (isDocumentHtml(hookReturnValue)) {
        documentHtml = hookReturnValue;
        return { documentHtml, pageContextProvidedByRenderHook, pageContextPromise, injectFilter };
    }
    const errPrefix = `The ${renderHook.hookName}() hook defined at ${renderHook.hookFilePath}`;
    const errSuffix = `a string generated with ${pc.cyan('escapeInject`<html>...</html>`')} or the value returned by ${pc.cyan('dangerouslySkipEscape()')}, see https://vike.dev/escapeInject`;
    if (typeof hookReturnValue === 'string') {
        assertWarning(false, [
            errPrefix,
            `returned a plain JavaScript string which is ${pc.red(pc.bold('dangerous'))}: it should instead return`,
            errSuffix,
        ].join(' '), { onlyOnce: true });
        hookReturnValue = dangerouslySkipEscape(hookReturnValue);
    }
    const wrongReturnValue = `should return the value ${pc.cyan('documentHtml')} or an object ${pc.cyan('{ documentHtml }')} where ${pc.cyan('documentHtml')} is ${errSuffix}`;
    assertUsage(isObject(hookReturnValue), `${errPrefix} ${wrongReturnValue}`);
    assertHookReturnedObject(hookReturnValue, ['documentHtml', 'pageContext', 'injectFilter'], errPrefix);
    assertUsage(hookReturnValue.documentHtml, `${errPrefix} returned an object that is missing the ${pc.code('documentHtml')} property: it ${wrongReturnValue}`);
    if (hookReturnValue.injectFilter) {
        assertUsage(isCallable(hookReturnValue.injectFilter), 'injectFilter should be a function');
        injectFilter = hookReturnValue.injectFilter;
    }
    {
        let val = hookReturnValue.documentHtml;
        const errBegin = `${errPrefix} returned ${pc.cyan('{ documentHtml }')}, but ${pc.cyan('documentHtml')}`;
        if (typeof val === 'string') {
            assertWarning(false, [
                errBegin,
                `is a plain JavaScript string which is ${pc.bold(pc.red('dangerous'))}: ${pc.cyan('documentHtml')} should be`,
                errSuffix,
            ].join(' '), { onlyOnce: true });
            val = dangerouslySkipEscape(val);
        }
        assertUsage(isDocumentHtml(val), [errBegin, 'should be', errSuffix].join(' '));
        documentHtml = val;
    }
    if (hookReturnValue.pageContext) {
        const val = hookReturnValue.pageContext;
        const errBegin = `${errPrefix} returned ${pc.cyan('{ pageContext }')}, but ${pc.cyan('pageContext')}`;
        if (isPromise(val) || isCallable(val)) {
            assertWarning(!isPromise(val), `${errBegin} is a promise which is deprecated in favor of async functions, see https://vike.dev/streaming#initial-data-after-stream-end`, { onlyOnce: true });
            pageContextPromise = val;
        }
        else {
            assertUsage(isObject(val), `${errBegin} should be an object or an async function, see https://vike.dev/streaming#initial-data-after-stream-end`);
            assertPageContextProvidedByUser(val, renderHook);
            pageContextProvidedByRenderHook = val;
        }
    }
    return { documentHtml, pageContextProvidedByRenderHook, pageContextPromise, injectFilter };
}
