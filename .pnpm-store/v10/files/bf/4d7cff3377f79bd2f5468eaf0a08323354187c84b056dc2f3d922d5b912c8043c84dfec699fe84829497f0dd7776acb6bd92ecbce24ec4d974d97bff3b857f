export { createHttpResponsePage };
export { createHttpResponsePageJson };
export { createHttpResponseErrorFallback };
export { createHttpResponseErrorFallback_noGlobalContext };
export { createHttpResponseErrorFallbackJson };
export { createHttpResponseRedirect };
export { createHttpResponse404 };
export { createHttpResponseBaseIsMissing };
export { createHttpResponseFromUniversalMiddleware };
export type { HttpResponse };
import type { GetPageAssets } from './getPageAssets.js';
import type { HtmlRender } from './html/renderHtml.js';
import type { RenderHook } from './execHookOnRenderHtml.js';
import type { AbortStatusCode, UrlRedirect } from '../../../shared-server-client/route/abort.js';
import { HttpResponseBody } from './getHttpResponseBody.js';
import { type EarlyHint } from './getEarlyHints.js';
import type { PageContextBegin } from '../renderPageServer.js';
import type { GlobalContextServerInternal } from '../globalContext.js';
import '../../assertEnvServer.js';
type HttpResponse = {
    statusCode: number;
    headers: [string, string][];
    earlyHints: EarlyHint[];
    /** **Deprecated**: use `headers` instead, see https://vike.dev/migration/0.4.134 */
    contentType: string | undefined;
} & HttpResponseBody;
declare function createHttpResponsePage(htmlRender: HtmlRender, renderHook: null | RenderHook, pageContext: {
    pageId: null | string;
    is404: null | boolean;
    errorWhileRendering: null | Error;
    __getPageAssets: GetPageAssets;
    _globalContext: GlobalContextServerInternal;
    abortStatusCode?: AbortStatusCode;
    headersResponse?: Headers;
}): Promise<HttpResponse>;
declare function createHttpResponse404(errMsg404: string): HttpResponse;
declare function createHttpResponseBaseIsMissing(urlOriginal: string, baseServer: string): HttpResponse;
declare function createHttpResponseErrorFallback(pageContext: {
    _globalContext: GlobalContextServerInternal;
}): HttpResponse;
declare function createHttpResponseErrorFallback_noGlobalContext(): HttpResponse;
declare function createHttpResponseErrorFallbackJson(): HttpResponse;
declare function createHttpResponsePageJson(pageContextSerialized: string): Promise<HttpResponse>;
declare function createHttpResponseRedirect({ url, statusCode }: UrlRedirect, pageContextInit: PageContextBegin): HttpResponse;
declare function createHttpResponseFromUniversalMiddleware(response: Response, earlyHints?: EarlyHint[]): HttpResponse;
