export { createPageContextServer };
export { createPageContextServerWithoutGlobalContext };
import { normalizeHeaders } from '../../../utils/normalizeHeaders.js';
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { updateType } from '../../../utils/updateType.js';
import { getPageContextUrlComputed } from '../../../shared-server-client/getPageContextUrlComputed.js';
import { createPageContextObject, createPageContextShared, } from '../../../shared-server-client/createPageContextShared.js';
import '../../assertEnvServer.js';
function createPageContextServer(pageContextInit, globalContext, args) {
    assert(pageContextInit.urlOriginal);
    const pageContext = createPageContextBase(pageContextInit, args.isPrerendering, args.requestId);
    objectAssign(pageContext, {
        _globalContext: globalContext,
        _pageFilesAll: globalContext._pageFilesAll, // TO-DO/next-major-release: remove
        // We use pageContext._baseServer and pageContext._baseAssets instead of pageContext._globalContext.baseServer and pageContext._globalContext.baseAssets because the Base URLs can (eventually one day if needed) be made non-global
        _baseServer: globalContext.baseServer,
        _baseAssets: globalContext.baseAssets,
        _pageContextInit: pageContextInit,
        _urlHandler: args.isPrerendering ? null : args.urlHandler,
        isClientSideNavigation: args.isPrerendering ? false : args.isClientSideNavigation,
    });
    objectAssign(pageContext, globalContext._globalConfigPublic);
    // pageContext.urlParsed
    const pageContextUrlComputed = getPageContextUrlComputed(pageContext);
    objectAssign(pageContext, pageContextUrlComputed);
    // pageContext.headers
    {
        let headers;
        if (pageContextInit.headersOriginal) {
            headers = normalizeHeaders(pageContextInit.headersOriginal);
            assertUsage(!('headers' in pageContextInit), "You're defining pageContextInit.headersOriginal as well as pageContextInit.headers but you should only define pageContextInit.headersOriginal instead, see https://vike.dev/headers");
        }
        else if (pageContextInit.headers) {
            headers = pageContextInit.headers;
            // TO-DO/next-major-release: remove
            assertWarning(false, 'Setting pageContextInit.headers is deprecated: set pageContextInit.headersOriginal instead, see https://vike.dev/headers', { onlyOnce: true });
        }
        else {
            headers = null;
        }
        objectAssign(pageContext, { headers });
    }
    const pageContextAugmented = createPageContextShared(pageContext, globalContext._globalConfigPublic);
    updateType(pageContext, pageContextAugmented);
    return pageContext;
}
/** Use this as last resort — prefer passing richer `pageContext` objects to the runtime logger */
function createPageContextServerWithoutGlobalContext(pageContextInit, requestId) {
    const pageContext = createPageContextBase(pageContextInit, false, requestId);
    return pageContext;
}
function createPageContextBase(pageContextInit, isPrerendering, requestId) {
    const pageContext = createPageContextObject();
    objectAssign(pageContext, {
        isClientSide: false,
        isPrerendering,
        _requestId: requestId,
    });
    objectAssign(pageContext, pageContextInit);
    return pageContext;
}
