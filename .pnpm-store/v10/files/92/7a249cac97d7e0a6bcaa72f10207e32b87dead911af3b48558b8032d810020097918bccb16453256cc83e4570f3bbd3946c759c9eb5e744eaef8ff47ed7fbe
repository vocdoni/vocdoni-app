export { renderPageServerAfterRoute };
export { prerenderPage };
export { prerenderPageEntry };
import { getErrorPageId } from '../../../shared-server-client/error-page.js';
import { getHtmlString } from './html/renderHtml.js';
import { assert, assertUsage } from '../../../utils/assert.js';
import { hasProp } from '../../../utils/hasProp.js';
import { isSameErrorMessage } from '../../../utils/isSameErrorMessage.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { updateType } from '../../../utils/updateType.js';
import { getPageContextClientSerialized } from './html/serializeContext.js';
import { createHttpResponsePage, createHttpResponsePageJson } from './createHttpResponse.js';
import { loadPageConfigsLazyServerSide, } from './loadPageConfigsLazyServerSide.js';
import { execHookOnRenderHtml } from './execHookOnRenderHtml.js';
import { execHookDataAndOnBeforeRender } from './execHookDataAndOnBeforeRender.js';
import { logRuntimeError } from '../loggerRuntime.js';
import { getPageContextPublicServer } from './getPageContextPublicServer.js';
import { execHookGuard } from '../../../shared-server-client/route/execHookGuard.js';
import pc from '@brillout/picocolors';
import { isServerSideError } from '../../../shared-server-client/misc/isServerSideError.js';
import { getAsyncLocalStorage } from '../asyncHook.js';
import '../../assertEnvServer.js';
async function renderPageServerAfterRoute(pageContext) {
    // pageContext.pageId can either be the:
    //  - ID of the page matching the routing, or the
    //  - ID of the error page `_error.page.js`.
    assert(hasProp(pageContext, 'pageId', 'string'));
    const isError = pageContext.is404 || !!pageContext.errorWhileRendering;
    assert(isError ===
        (pageContext.pageId ===
            getErrorPageId(pageContext._globalContext._pageFilesAll, pageContext._globalContext._pageConfigs)));
    updateType(pageContext, await loadPageConfigsLazyServerSide(pageContext));
    if (!isError) {
        await execHookGuard(pageContext, (pageContext) => getPageContextPublicServer(pageContext));
    }
    if (!isError) {
        await execHookDataAndOnBeforeRender(pageContext);
    }
    else {
        try {
            await execHookDataAndOnBeforeRender(pageContext);
        }
        catch (err) {
            if (isSameErrorMessage(err, pageContext.errorWhileRendering)) {
                logRuntimeError(err, pageContext);
            }
        }
    }
    if (pageContext.isClientSideNavigation) {
        if (isError) {
            objectAssign(pageContext, { [isServerSideError]: true });
        }
        const pageContextSerialized = getPageContextClientSerialized(pageContext, false);
        const httpResponse = await createHttpResponsePageJson(pageContextSerialized);
        objectAssign(pageContext, { httpResponse });
        return pageContext;
    }
    const renderHookResult = await execHookOnRenderHtml(pageContext);
    const { htmlRender, renderHook } = renderHookResult;
    const httpResponse = await createHttpResponsePage(htmlRender, renderHook, pageContext);
    objectAssign(pageContext, { httpResponse });
    return pageContext;
}
async function prerenderPage(pageContext) {
    const asyncLocalStorage = await getAsyncLocalStorage();
    const requestId = pageContext._requestId;
    assert(requestId);
    const asyncStore = !asyncLocalStorage ? null : { requestId, pageContext };
    objectAssign(pageContext, { _asyncStore: asyncStore, _requestId: requestId });
    const render = async () => await prerenderPageEntry(pageContext);
    if (asyncLocalStorage) {
        return await asyncLocalStorage.run(asyncStore, render);
    }
    else {
        return await render();
    }
}
async function prerenderPageEntry(pageContext) {
    objectAssign(pageContext, {
        _isPageContextJsonRequest: null,
        pageContextsAborted: [],
    });
    /* Should we execute the guard() hook upon pre-rendering? Is there a use case for this?
     *  - It isn't trivial to implement, as it requires to duplicate / factor out the isAbortError() handling
    await execHookGuard(pageContext, (pageContext) => getPageContextPublicServer(pageContext))
    */
    await execHookDataAndOnBeforeRender(pageContext);
    const { htmlRender, renderHook } = await execHookOnRenderHtml(pageContext);
    assertUsage(htmlRender !== null, `Cannot pre-render ${pc.cyan(pageContext.urlOriginal)} because the ${renderHook.hookName}() hook defined by ${renderHook.hookFilePath} didn't return an HTML string.`);
    const documentHtml = await getHtmlString(htmlRender);
    assert(typeof documentHtml === 'string');
    if (!pageContext._usesClientRouter) {
        return { documentHtml, pageContextSerialized: null, pageContext };
    }
    else {
        const pageContextSerialized = getPageContextClientSerialized(pageContext, false);
        return { documentHtml, pageContextSerialized, pageContext };
    }
}
