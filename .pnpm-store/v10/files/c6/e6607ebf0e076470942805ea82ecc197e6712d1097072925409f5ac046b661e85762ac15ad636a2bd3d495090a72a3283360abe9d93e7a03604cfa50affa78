export { getPageContextClientSerialized };
export { getPageContextClientSerializedAbort };
export { getGlobalContextClientSerialized };
export type { PageContextSerialization };
export type { PassToClient };
export type { PassToClientPublic };
import type { UrlRedirect } from '../../../../shared-server-client/route/abort.js';
import type { GlobalContextServerInternal } from '../../globalContext.js';
import type { PageContextCreatedServer } from '../createPageContextServer.js';
import type { PageContextBegin } from '../../renderPageServer.js';
import type { PageContextCspNonce } from '../csp.js';
import '../../../assertEnvServer.js';
type PageContextSerialization = PageContextCreatedServer & {
    pageId: string;
    routeParams: Record<string, string>;
    _passToClient: PassToClient;
    is404: null | boolean;
    pageProps?: Record<string, unknown>;
    _pageContextInit: Record<string, unknown>;
    _globalContext: GlobalContextServerInternal;
    _isPageContextJsonRequest: null | PageContextBegin['_isPageContextJsonRequest'];
} & PageContextCspNonce;
declare function getPageContextClientSerialized(pageContext: PageContextSerialization, isHtmlJsonScript: boolean): string;
declare function getGlobalContextClientSerialized(pageContext: PageContextSerialization, isHtmlJsonScript: boolean): string;
type PassToClient = string[];
type PassToClientPublic = (string | {
    prop: string;
    /** @deprecated The passToClient once setting is deprecated and no longer has any effect. Instead, see the upcoming .once.js suffix (see https://github.com/vikejs/vike/issues/2566 for more information). */
    once?: boolean;
})[];
declare function getPageContextClientSerializedAbort(pageContext: Record<string, unknown> & ({
    _urlRedirect: UrlRedirect;
} | {
    _urlRewrite: string;
} | {
    abortStatusCode: number;
}), isHtmlJsonScript: false): string;
