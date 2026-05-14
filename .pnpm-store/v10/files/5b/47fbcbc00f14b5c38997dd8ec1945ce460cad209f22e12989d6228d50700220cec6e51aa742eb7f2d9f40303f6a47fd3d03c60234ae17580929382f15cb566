export { renderPageServer };
export { getRequestTag };
import { renderPageServerAfterRoute } from './renderPageServer/renderPageServerAfterRoute.js';
import { createPageContextServer, createPageContextServerWithoutGlobalContext, } from './renderPageServer/createPageContextServer.js';
import { route } from '../../shared-server-client/route/index.js';
import { assert, assertWarning, assertUsage } from '../../utils/assert.js';
import { onSetupRuntime } from '../../utils/assertSetup.js';
import { catchInfiniteLoop } from '../../utils/catchInfiniteLoop.js';
import { checkType } from '../../utils/checkType.js';
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { hasProp } from '../../utils/hasProp.js';
import { isSameErrorMessage } from '../../utils/isSameErrorMessage.js';
import { objectAssign } from '../../utils/objectAssign.js';
import { normalizeUrlPathname, removeBaseServer, modifyUrlPathname, prependBase, removeUrlOrigin, setUrlOrigin, getUrlPretty, } from '../../utils/parseUrl-extras.js';
import { isUrl, parseUrl, isUri } from '../../utils/parseUrl.js';
import { updateType } from '../../utils/updateType.js';
import { getPageContextAddendumAbort, isAbortError, logAbort, addNewPageContextAborted, } from '../../shared-server-client/route/abort.js';
import { getGlobalContextServerInternal, initGlobalContext_renderPage, } from './globalContext.js';
import { handlePageContextRequestUrl } from './renderPageServer/handlePageContextRequestUrl.js';
import { createHttpResponse404, createHttpResponseRedirect, createHttpResponsePageJson, createHttpResponseErrorFallback, createHttpResponseErrorFallback_noGlobalContext, createHttpResponseBaseIsMissing, createHttpResponseFromUniversalMiddleware, } from './renderPageServer/createHttpResponse.js';
import { logRuntimeError, logRuntimeInfo } from './loggerRuntime.js';
import { assertArguments } from './renderPageServer/assertArguments.js';
import { log404 } from './renderPageServer/log404/index.js';
import pc from '@brillout/picocolors';
import { getPageContextClientSerializedAbort, getPageContextClientSerialized, } from './renderPageServer/html/serializeContext.js';
import { getErrorPageId } from '../../shared-server-client/error-page.js';
import { handleErrorWithoutErrorPage } from './renderPageServer/handleErrorWithoutErrorPage.js';
import { loadPageConfigsLazyServerSide, } from './renderPageServer/loadPageConfigsLazyServerSide.js';
import { resolveRedirects } from './renderPageServer/resolveRedirects.js';
import { getVikeConfigError } from '../../shared-server-node/getVikeConfigError.js';
import { forkPageContext } from '../../shared-server-client/forkPageContext.js';
import { getAsyncLocalStorage } from './asyncHook.js';
import '../assertEnvServer.js';
import { enhance, apply, universalSymbol, UniversalRouter, getAdapterRuntime, } from '@universal-middleware/core';
import { createRequestAdapter } from '@universal-middleware/node/request';
const globalObject = getGlobalObject('runtime/renderPageServer.ts', {
    httpRequestsCount: 0,
});
// `renderPageServer()` calls `renderPageServerNominal()` while ensuring that errors are `console.error(err)` instead of `throw err`, so that Vike never triggers a server shut down. (Throwing an error in an Express.js middleware shuts down the whole Express.js server.)
async function renderPageServer(pageContextInit) {
    assertArguments(...arguments);
    assert(hasProp(pageContextInit, 'urlOriginal', 'string')); // assertUsage() already implemented at assertArguments()
    assertIsUrl(pageContextInit.urlOriginal);
    onSetupRuntime();
    const requestId = getRequestId();
    const pageContextSkipRequest = getPageContextSkipRequest(pageContextInit, requestId);
    if (pageContextSkipRequest)
        return pageContextSkipRequest;
    const urlOriginalPretty = getUrlPretty(pageContextInit.urlOriginal);
    logHttpRequest(urlOriginalPretty, pageContextInit, requestId);
    const asyncLocalStorage = await getAsyncLocalStorage();
    const asyncStore = !asyncLocalStorage ? null : { requestId };
    const render = async () => await renderPageServerEntryOnceBegin(pageContextInit, requestId, asyncStore);
    const pageContextFinish = !asyncLocalStorage ? await render() : await asyncLocalStorage.run(asyncStore, render);
    logHttpResponse(urlOriginalPretty, pageContextFinish);
    checkType(pageContextFinish);
    assertPageContextFinish(pageContextFinish);
    return pageContextFinish;
}
async function renderPageServerEntryOnceBegin(pageContextInit, requestId, asyncStore) {
    // Invalid config
    {
        const vikeConfigError = getVikeConfigError();
        if (vikeConfigError) {
            return getPageContextInvalidVikeConfig(vikeConfigError.err, pageContextInit, requestId);
        }
    }
    // Prepare context
    try {
        await initGlobalContext_renderPage();
    }
    catch (err) {
        // Errors are expected:
        // - assertUsage() such as:
        //   ```bash
        //   Re-build your app (you're using 1.2.3 but your app was built with 1.2.2)
        //   ```
        // - initGlobalContext_renderPage() depends on +onCreateGlobalContext hooks
        assert(!isAbortError(err));
        const pageContext = createPageContextServerWithoutGlobalContext(pageContextInit, requestId);
        logRuntimeError(err, pageContext);
        const pageContextHttpErrorFallback = getPageContextHttpErrorFallback_noGlobalContext(err, pageContextInit, requestId);
        return pageContextHttpErrorFallback;
    }
    {
        const vikeConfigError = getVikeConfigError();
        if (vikeConfigError) {
            return getPageContextInvalidVikeConfig(vikeConfigError.err, pageContextInit, requestId);
        }
        else {
            // `globalContext` now contains the entire Vike config and getVikeConfig() isn't called anymore for this request.
        }
    }
    const { globalContext } = await getGlobalContextServerInternal();
    const pageContextBegin = getPageContextBegin(pageContextInit, globalContext, requestId, asyncStore);
    const middlewares = (globalContext.config.middleware ?? []).flat();
    const renderPageServerEntry = () => renderPageServerEntryOnce(pageContextBegin, globalContext, requestId);
    if (middlewares.length === 0) {
        return renderPageServerEntry();
    }
    else {
        return renderPageServerEntryWithMiddlewares(pageContextBegin, renderPageServerEntry, middlewares);
    }
}
async function renderPageServerEntryOnce(pageContextBegin, globalContext, requestId) {
    // Check Base URL
    {
        const pageContextHttpResponse = await checkBaseUrl(pageContextBegin, globalContext);
        if (pageContextHttpResponse)
            return pageContextHttpResponse;
    }
    // Normalize URL
    {
        const pageContextHttpResponse = await normalizeUrl(pageContextBegin, globalContext);
        if (pageContextHttpResponse)
            return pageContextHttpResponse;
    }
    // Permanent redirects (HTTP status code `301`)
    {
        const pageContextHttpResponse = await getPermanentRedirect(pageContextBegin, globalContext);
        if (pageContextHttpResponse)
            return pageContextHttpResponse;
    }
    // First renderPageServerEntryRecursive() call
    return await renderPageServerEntryRecursive(pageContextBegin, globalContext, requestId);
}
async function renderPageServerEntryRecursive(pageContextBegin, globalContext, requestId) {
    catchInfiniteLoop(`[${getRequestTag(requestId)}] renderPageServerEntryRecursive()`);
    const pageContextNominalPageBegin = fork(pageContextBegin);
    const pageContextAddendumAbort = getPageContextAddendumAbort(pageContextBegin.pageContextsAborted);
    objectAssign(pageContextNominalPageBegin, pageContextAddendumAbort);
    objectAssign(pageContextNominalPageBegin, { errorWhileRendering: null });
    const onError = async (err) => {
        assert(err);
        assert(pageContextNominalPageSuccess === undefined);
        logRuntimeError(err, pageContextNominalPageBegin);
        return await renderPageServerEntryRecursive_onError(err, pageContextBegin, pageContextNominalPageBegin, globalContext, requestId);
    };
    // Route
    let pageContextFromRoute;
    try {
        pageContextFromRoute = await route(pageContextNominalPageBegin);
    }
    catch (err) {
        return await onError(err);
    }
    objectAssign(pageContextNominalPageBegin, pageContextFromRoute);
    if (pageContextNominalPageBegin.pageId !== null) {
        assert(pageContextNominalPageBegin.pageId);
        objectAssign(pageContextNominalPageBegin, { is404: null });
    }
    else {
        objectAssign(pageContextNominalPageBegin, { is404: true });
        log404(pageContextNominalPageBegin);
        const errorPageId = getErrorPageId(pageContextNominalPageBegin._globalContext._pageFilesAll, pageContextNominalPageBegin._globalContext._pageConfigs);
        if (!errorPageId) {
            assert(hasProp(pageContextNominalPageBegin, 'pageId', 'null')); // Help TS
            return handleErrorWithoutErrorPage(pageContextNominalPageBegin);
        }
        objectAssign(pageContextNominalPageBegin, { pageId: errorPageId });
    }
    assert(hasProp(pageContextNominalPageBegin, 'pageId', 'string'));
    assert(pageContextNominalPageBegin.errorWhileRendering === null);
    // - Render page (nominal, i.e. not the error page)
    // - Render 404 page
    // (`var` instead of `let` because of assert() above that can be called before reaching this line https://stackoverflow.com/a/11444416/270274)
    var pageContextNominalPageSuccess;
    try {
        pageContextNominalPageSuccess = await renderPageServerAfterRoute(pageContextNominalPageBegin);
    }
    catch (err) {
        return await onError(err);
    }
    assert(pageContextNominalPageBegin === pageContextNominalPageSuccess);
    return pageContextNominalPageSuccess;
}
// When the normal page threw an error
// - Can be a URL rewrite upon `throw render('/some-url')`
// - Can be rendering the error page
// - Can be rendering Vike's generic error page (if no error page is defined, or if the error page throws an error)
async function renderPageServerEntryRecursive_onError(err, pageContextBegin, pageContextNominalPageBegin, globalContext, requestId) {
    assert(pageContextNominalPageBegin);
    assert(hasProp(pageContextNominalPageBegin, 'urlOriginal', 'string'));
    assert(err);
    const pageContextErrorPageInit = fork(pageContextBegin);
    objectAssign(pageContextErrorPageInit, {
        is404: false,
        errorWhileRendering: err,
        routeParams: {},
    });
    // Handle `throw redirect()` and `throw render()` while rendering nominal page
    if (isAbortError(err)) {
        const handled = await handleAbort(err, pageContextBegin, pageContextNominalPageBegin, requestId, pageContextErrorPageInit, globalContext);
        if (handled.pageContextReturn) {
            // - throw redirect()
            // - throw render(url)
            // - throw render(abortStatusCode) if pageContext.json request
            return handled.pageContextReturn;
        }
        else {
            // - throw render(abortStatusCode) if not pageContext.json request
            objectAssign(pageContextErrorPageInit, handled.pageContextAbort);
        }
    }
    {
        const errorPageId = getErrorPageId(globalContext._pageFilesAll, globalContext._pageConfigs);
        if (!errorPageId) {
            objectAssign(pageContextErrorPageInit, { pageId: null });
            return handleErrorWithoutErrorPage(pageContextErrorPageInit);
        }
        objectAssign(pageContextErrorPageInit, { pageId: errorPageId });
    }
    let pageContextErrorPage;
    try {
        pageContextErrorPage = await renderPageServerAfterRoute(pageContextErrorPageInit);
    }
    catch (errErrorPage) {
        // Handle `throw redirect()` and `throw render()` while rendering error page
        if (isAbortError(errErrorPage)) {
            const handled = await handleAbort(errErrorPage, pageContextBegin, pageContextNominalPageBegin, requestId, pageContextErrorPageInit, globalContext);
            if (handled.pageContextReturn) {
                // - throw redirect()
                // - throw render(url)
                return handled.pageContextReturn;
            }
            else {
                // - throw render(abortStatusCode)
                const pageContextAbort = errErrorPage._pageContextAbort;
                assertWarning(false, `Failed to render error page because ${pc.cyan(pageContextAbort._abortCall)} was called: make sure ${pc.cyan(pageContextAbort._abortCaller)} doesn't occur while the error page is being rendered.`, { onlyOnce: false });
                const pageContextHttpErrorFallback = getPageContextHttpErrorFallback(err, pageContextBegin);
                return pageContextHttpErrorFallback;
            }
        }
        if (isSameErrorMessage(errErrorPage, err)) {
            logRuntimeError(errErrorPage, pageContextErrorPageInit);
        }
        const pageContextHttpErrorFallback = getPageContextHttpErrorFallback(err, pageContextBegin);
        return pageContextHttpErrorFallback;
    }
    return pageContextErrorPage;
}
const requestAdapter = createRequestAdapter();
async function renderPageServerEntryWithMiddlewares(pageContext, renderPageServerEntry, middlewares) {
    const router = new UniversalRouter(true, false);
    let httpResponseVikeCore = undefined;
    // Wrap rendering into universal-middleware routing
    apply(router, [
        enhance(async function adaptRenderPageServerEntryOnceInternal() {
            const pageContextHttpResponse = await renderPageServerEntry();
            const { httpResponse } = pageContextHttpResponse;
            pageContext = pageContextHttpResponse;
            httpResponseVikeCore = httpResponse;
            const readable = httpResponse.getReadableWebStream();
            return new Response(readable, {
                status: httpResponse.statusCode,
                headers: httpResponse.headers,
            });
        }, {
            name: 'vike',
            method: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS'],
            path: '/**', // rou3 format
            immutable: true, // avoids cloning the function we just created
        }),
        ...middlewares,
    ]);
    const handler = router[universalSymbol];
    const request = pageContext._reqWeb ??
        (pageContext._reqDev
            ? requestAdapter(pageContext._reqDev)
            : new Request(new URL(pageContext.urlOriginal, 'http://localhost').toString(), {
                headers: pageContext.headers ?? {},
            }));
    const res = await handler(request, {}, getAdapterRuntime('other', { params: undefined }));
    const httpResponse = createHttpResponseFromUniversalMiddleware(res, httpResponseVikeCore?.earlyHints);
    objectAssign(pageContext, { httpResponse });
    return pageContext;
}
function logHttpRequest(urlOriginal, pageContextInit, requestId) {
    const pageContext = createPageContextServerWithoutGlobalContext(pageContextInit, requestId);
    logRuntimeInfo?.(getRequestInfoMessage(urlOriginal), pageContext, 'info');
}
/* Alternative icons:
const arrowRight = pc.dim('»')
const arrowLeft = pc.dim('«')
const arrowRight = pc.dim('>>')
const arrowLeft = pc.dim('<<')
*/
const arrowRight = pc.dim('→');
const arrowLeft = pc.dim('←');
function getRequestInfoMessage(urlOriginal) {
    return `HTTP request  ${arrowRight} ${prettyUrl(urlOriginal)}`;
}
function logHttpResponse(urlOriginalPretty, pageContextReturn) {
    const statusCode = pageContextReturn.httpResponse?.statusCode ?? null;
    let msg;
    let isNominal;
    {
        const { errorWhileRendering } = pageContextReturn;
        const isSkipped = statusCode === null && !errorWhileRendering;
        if (isSkipped) {
            // - URL doesn't include Base URL
            //   - Can we abort earlier so that `logHttpResponse()` and `logHttpRequest()` aren't even called?
            // - Error loading a Vike config file
            //   - We should show `HTTP response ${urlOriginalPretty} ERR` instead.
            //   - Maybe we can/should make the error available at pageContext.errorWhileRendering
            assert(errorWhileRendering === null || errorWhileRendering === undefined);
            msg = `HTTP response ${arrowLeft} ${prettyUrl(urlOriginalPretty)} ${pc.dim('null')}`;
            // Erroneous value (it should sometimes be `false`) but it's fine as it doesn't seem to have much of an impact.
            isNominal = true;
        }
        else {
            const isSuccess = statusCode !== null && statusCode >= 200 && statusCode <= 399;
            isNominal = isSuccess || statusCode === 404;
            const color = (s) => pc.bold(isSuccess ? pc.green(String(s)) : pc.red(String(s)));
            const isRedirect = statusCode && 300 <= statusCode && statusCode <= 399;
            const type = isRedirect ? 'redirect' : `response ${arrowLeft}`;
            if (isRedirect) {
                assert(pageContextReturn.httpResponse);
                const headerRedirect = pageContextReturn.httpResponse.headers
                    .slice()
                    .reverse()
                    .find((header) => header[0] === 'Location');
                assert(headerRedirect);
                const urlRedirect = headerRedirect[1];
                urlOriginalPretty = urlRedirect;
            }
            msg = `HTTP ${type} ${prettyUrl(urlOriginalPretty)} ${color(statusCode ?? 'ERR')}`;
        }
    }
    logRuntimeInfo?.(msg, pageContextReturn, isNominal ? 'info' : 'error');
}
function prettyUrl(url) {
    try {
        url = decodeURI(url);
    }
    catch {
        // https://github.com/vikejs/vike/pull/2367#issuecomment-2800967564
    }
    return pc.bold(url);
}
function getPageContextHttpErrorFallback(err, pageContextBegin) {
    const pageContextHttpErrorFallback = fork(pageContextBegin);
    const httpResponse = createHttpResponseErrorFallback(pageContextBegin);
    objectAssign(pageContextHttpErrorFallback, {
        httpResponse,
        errorWhileRendering: err,
    });
    return pageContextHttpErrorFallback;
}
function getPageContextHttpErrorFallback_noGlobalContext(err, pageContextInit, requestId) {
    const pageContextHttpErrorFallback = createPageContextServerWithoutGlobalContext(pageContextInit, requestId);
    const httpResponse = createHttpResponseErrorFallback_noGlobalContext();
    objectAssign(pageContextHttpErrorFallback, {
        httpResponse,
        errorWhileRendering: err,
    });
    return pageContextHttpErrorFallback;
}
function getPageContextBegin(pageContextInit, globalContext, requestId, asyncStore) {
    const { isClientSideNavigation, _urlHandler, _isPageContextJsonRequest } = handlePageContextUrl(pageContextInit.urlOriginal);
    const pageContextBegin = createPageContextServer(pageContextInit, globalContext, {
        isPrerendering: false,
        urlHandler: _urlHandler,
        isClientSideNavigation,
        requestId,
    });
    objectAssign(pageContextBegin, {
        _requestId: requestId,
        _asyncStore: asyncStore,
        _isPageContextJsonRequest,
        // This array is shared between all pageContext objects, i.e. the following is true for any `i` and `j` index:
        // ```js
        // const pageContextsAborted_i = pageContextsAborted[i].pageContextsAborted
        // const pageContextsAborted_j = pageContextsAborted[j].pageContextsAborted
        // assert(pageContextsAborted_i === pageContextsAborted_j)
        // ```
        pageContextsAborted: [],
    });
    return pageContextBegin;
}
function handlePageContextUrl(urlOriginal) {
    const { isPageContextJsonRequest } = handlePageContextRequestUrl(urlOriginal);
    return {
        isClientSideNavigation: !!isPageContextJsonRequest,
        _isPageContextJsonRequest: isPageContextJsonRequest,
        _urlHandler: (url) => handlePageContextRequestUrl(url).urlWithoutPageContextRequestSuffix,
    };
}
function getRequestId() {
    const requestId = ++globalObject.httpRequestsCount;
    assert(requestId >= 1);
    return requestId;
}
function assertIsUrl(urlOriginal) {
    assertUsage(isUrl(urlOriginal), `${pc.code('renderPage(pageContextInit)')} (https://vike.dev/renderPage) called with ${pc.code(`pageContextInit.urlOriginal===${JSON.stringify(urlOriginal)}`)} which isn't a valid URL.`);
}
function assertIsNotViteRequest(urlPathname, urlOriginal) {
    const isViteRequest = urlPathname.startsWith('/@vite/client') || urlPathname.startsWith('/@fs/') || urlPathname.startsWith('/__vite_ping');
    if (!isViteRequest)
        return;
    assertUsage(false, `${pc.code('renderPage(pageContextInit)')} called with ${pc.code(`pageContextInit.urlOriginal===${JSON.stringify(urlOriginal)}`)} which is unexpected because the URL ${pc.bold(urlOriginal)} should have already been handled by the development middleware: make sure the ${pc.cyan('createDevMiddleware()')} middleware is executed *before* the ${pc.cyan('renderPage()')} middleware, see ${pc.underline('https://vike.dev/renderPage')}`);
}
async function normalizeUrl(pageContextBegin, globalContext) {
    const pageContext = fork(pageContextBegin);
    const { trailingSlash, disableUrlNormalization } = globalContext.config;
    if (disableUrlNormalization)
        return null;
    const { urlOriginal } = pageContext;
    const { isPageContextJsonRequest } = handlePageContextRequestUrl(urlOriginal);
    if (isPageContextJsonRequest)
        return null;
    const urlNormalized = normalizeUrlPathname(urlOriginal, trailingSlash ?? false, globalContext.baseServer);
    if (!urlNormalized)
        return null;
    logRuntimeInfo?.(`URL normalized from ${pc.cyan(urlOriginal)} to ${pc.cyan(urlNormalized)} (https://vike.dev/url-normalization)`, pageContext, 'info');
    const httpResponse = createHttpResponseRedirect({ url: urlNormalized, statusCode: 301 }, pageContext);
    objectAssign(pageContext, { httpResponse });
    return pageContext;
}
async function getPermanentRedirect(pageContextBegin, globalContext) {
    const pageContext = fork(pageContextBegin);
    const urlWithoutBase = removeBaseServer(pageContext.urlOriginal, globalContext.baseServer);
    let origin = null;
    let urlTargetExternal = null;
    let urlTarget = modifyUrlPathname(urlWithoutBase, (urlPathname) => {
        const urlTarget = resolveRedirects(globalContext.config.redirects ?? [], urlPathname);
        if (urlTarget === null)
            return null;
        if (!isUrl(urlTarget)) {
            // E.g. `urlTarget === 'mailto:some@example.com'`
            assert(isUri(urlTarget));
            urlTargetExternal = urlTarget;
            return null;
        }
        const { urlModified, origin: origin_ } = removeUrlOrigin(urlTarget);
        origin = origin_;
        return urlModified;
    });
    if (urlTargetExternal) {
        urlTarget = urlTargetExternal;
    }
    else {
        let originChanged = false;
        if (origin) {
            const urlModified = setUrlOrigin(urlTarget, origin);
            if (urlModified !== false) {
                originChanged = true;
                urlTarget = urlModified;
            }
        }
        if (normalize(urlTarget) === normalize(urlWithoutBase))
            return null;
        if (!originChanged)
            urlTarget = prependBase(urlTarget, globalContext.baseServer);
        assert(urlTarget !== pageContext.urlOriginal);
    }
    logRuntimeInfo?.(`Permanent redirection defined by config.redirects (https://vike.dev/redirects)`, pageContext, 'info');
    const httpResponse = createHttpResponseRedirect({ url: urlTarget, statusCode: 301 }, pageContext);
    objectAssign(pageContext, { httpResponse });
    return pageContext;
}
function normalize(url) {
    return url || '/';
}
async function handleAbort(errAbort, pageContextBegin, 
// handleAbortError() creates a new pageContext object and we don't merge pageContextNominalPageBegin to it: we only use some pageContextNominalPageBegin information.
pageContextNominalPageBegin, requestId, pageContextErrorPageInit, globalContext) {
    logAbort(errAbort, globalContext._isProduction, pageContextNominalPageBegin);
    const pageContextAbort = errAbort._pageContextAbort;
    assert(pageContextAbort);
    addNewPageContextAborted(pageContextBegin.pageContextsAborted, pageContextNominalPageBegin, pageContextAbort);
    const pageContext = fork(pageContextBegin);
    const pageContextAddendumAbort = getPageContextAddendumAbort(pageContextBegin.pageContextsAborted);
    objectAssign(pageContext, pageContextAddendumAbort);
    assert(pageContextAddendumAbort === pageContextAbort);
    // Client-side navigation — [`pageContext.json` request](https://vike.dev/pageContext.json)
    if (pageContextBegin.isClientSideNavigation) {
        let pageContextSerialized;
        if (pageContextAbort.abortStatusCode) {
            const errorPageId = getErrorPageId(globalContext._pageFilesAll, globalContext._pageConfigs);
            const abortCall = pageContextAbort._abortCall;
            assert(abortCall);
            assertUsage(errorPageId, `You called ${pc.cyan(abortCall)} but you didn't define an error page, make sure to define one https://vike.dev/error-page`);
            objectAssign(pageContext, { pageId: errorPageId });
            objectAssign(pageContext, pageContextErrorPageInit, true);
            updateType(pageContext, await loadPageConfigsLazyServerSide(pageContext));
            // We include pageContextInit: we don't only serialize pageContextAbort because the error page may need to access pageContextInit
            pageContextSerialized = getPageContextClientSerialized(pageContext, false);
        }
        else {
            pageContextSerialized = getPageContextClientSerializedAbort(pageContextAbort, false);
        }
        const httpResponse = await createHttpResponsePageJson(pageContextSerialized);
        objectAssign(pageContext, { httpResponse });
        return { pageContextReturn: pageContext };
    }
    // URL Rewrite — `throw render(url)`
    if (pageContextAbort._urlRewrite) {
        // Recursive renderPageServerEntryRecursive() call
        const pageContextReturn = await renderPageServerEntryRecursive(pageContextBegin, globalContext, requestId);
        return { pageContextReturn };
    }
    // URL Redirection — `throw redirect()`
    if (pageContextAbort._urlRedirect) {
        const httpResponse = createHttpResponseRedirect(pageContextAbort._urlRedirect, pageContextBegin);
        objectAssign(pageContext, { httpResponse });
        return { pageContextReturn: pageContext };
    }
    // Render error page — `throw render(abortStatusCode)` if not pageContext.json request
    assert(pageContextAbort.abortStatusCode);
    return { pageContextAbort };
}
async function checkBaseUrl(pageContextBegin, globalContext) {
    const pageContext = fork(pageContextBegin);
    const { baseServer } = globalContext;
    const { urlOriginal } = pageContext;
    const { isBaseMissing } = parseUrl(urlOriginal, baseServer);
    if (!isBaseMissing)
        return;
    const httpResponse = createHttpResponseBaseIsMissing(urlOriginal, baseServer);
    objectAssign(pageContext, {
        httpResponse,
        isBaseMissing: true,
    });
    checkType(pageContext);
    return pageContext;
}
function getPageContextSkipRequest(pageContextInit, requestId) {
    const urlPathnameWithBase = parseUrl(pageContextInit.urlOriginal, '/').pathname;
    assertIsNotViteRequest(urlPathnameWithBase, pageContextInit.urlOriginal);
    let errMsg404;
    if (urlPathnameWithBase.endsWith('/favicon.ico')) {
        errMsg404 = 'No favicon.ico found';
    }
    if (urlPathnameWithBase.endsWith('.well-known/appspecific/com.chrome.devtools.json')) {
        // https://chromium.googlesource.com/devtools/devtools-frontend/+/main/docs/ecosystem/automatic_workspace_folders.md
        // https://www.reddit.com/r/node/comments/1kcr0wh/odd_request_coming_into_my_localhost_server_from/
        errMsg404 = 'Not supported';
    }
    if (!errMsg404)
        return;
    const pageContext = createPageContextServerWithoutGlobalContext(pageContextInit, requestId);
    const httpResponse = createHttpResponse404(errMsg404);
    objectAssign(pageContext, { httpResponse });
    checkType(pageContext);
    return pageContext;
}
function getPageContextInvalidVikeConfig(err, pageContextInit, requestId) {
    const pageContext = createPageContextServerWithoutGlobalContext(pageContextInit, requestId);
    logRuntimeInfo?.(pc.bold(pc.red('Error loading Vike config — see error above')), pageContext, 'error');
    const pageContextHttpErrorFallback = getPageContextHttpErrorFallback_noGlobalContext(err, pageContextInit, requestId);
    return pageContextHttpErrorFallback;
}
function fork(pageContext) {
    const pageContextNew = forkPageContext(pageContext);
    if (pageContext._asyncStore)
        pageContext._asyncStore.pageContext = pageContextNew;
    assert(pageContextNew._asyncStore === pageContext._asyncStore);
    return pageContextNew;
}
function assertPageContextFinish(pageContextFinish) {
    assert(pageContextFinish.httpResponse);
    if (pageContextFinish.isClientSideNavigation) {
        const headers = new Headers(pageContextFinish.httpResponse.headers);
        const contentType = headers.get('Content-Type');
        assert(contentType?.toLowerCase() === 'application/json');
    }
}
function getRequestTag(requestId) {
    return `request-${requestId}`;
}
