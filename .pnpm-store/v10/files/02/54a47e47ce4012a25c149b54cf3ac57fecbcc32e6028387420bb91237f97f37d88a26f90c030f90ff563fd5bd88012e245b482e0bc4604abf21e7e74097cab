export { resolveHeadersResponseEarly };
export { resolveHeadersResponseFinal };
import { addCspResponseHeader } from './csp.js';
import { isCallable } from '../../../utils/isCallable.js';
import { cacheControlDisable, getCacheControl } from './getCacheControl.js';
import '../../assertEnvServer.js';
function resolveHeadersResponseFinal(pageContext, statusCode) {
    const headersResponse = pageContext.headersResponse || new Headers();
    // 5xx error pages are temporary and shouldn't be cached.
    // This overrides any previously set Cache-Control value.
    if (statusCode >= 500)
        headersResponse.set('Cache-Control', cacheControlDisable);
    const headers = [];
    headersResponse.forEach((value, key) => {
        headers.push([key, value]);
    });
    return headers;
}
async function resolveHeadersResponseEarly(pageContext) {
    const headersResponse = await resolveHeadersResponseConfig(pageContext);
    if (!headersResponse.get('Cache-Control')) {
        const cacheControl = getCacheControl(pageContext.pageId, pageContext._globalContext._pageConfigs);
        if (cacheControl)
            headersResponse.set('Cache-Control', cacheControl);
    }
    addCspResponseHeader(pageContext, headersResponse);
    const pageContextAddendum = {
        headersResponse,
    };
    return pageContextAddendum;
}
async function resolveHeadersResponseConfig(pageContext) {
    const headersMerged = new Headers();
    await Promise.all((pageContext.config.headersResponse ?? []).map(async (headers) => {
        let headersInit;
        if (isCallable(headers)) {
            headersInit = await headers(pageContext);
        }
        else {
            headersInit = headers;
        }
        new Headers(headersInit).forEach((value, key) => {
            headersMerged.append(key, value);
        });
    }));
    return headersMerged;
}
