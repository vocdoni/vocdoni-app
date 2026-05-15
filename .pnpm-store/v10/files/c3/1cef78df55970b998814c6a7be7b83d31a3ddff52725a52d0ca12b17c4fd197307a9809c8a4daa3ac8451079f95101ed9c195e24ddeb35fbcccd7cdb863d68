export { renderPageClient };
export { getRenderCount };
export { disableClientRouting };
export { getPageContextClient };
export type { PageContextBegin };
export type { PageContextInternalClientAfterRender };
import { type PageContextCreatedClient } from './createPageContextClient.js';
import { type PageContextAbort, type PageContextAborted } from '../../shared-server-client/route/abort.js';
import { type ScrollTarget } from './setScrollPosition.js';
import type { PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import type { PageContextClient } from '../../types/PageContext.js';
import { type PageContextPublicClient } from './getPageContextPublicClient.js';
import type { VikeGlobalInternal } from '../../types/VikeGlobalInternal.js';
import '../assertEnvClient.js';
type PageContextInternalClientAfterRender = NonNullable<Awaited<ReturnType<typeof renderPageClient>>>;
type PreviousPageContext = {
    pageId: string;
} & PageContextConfig & PageContextRouted & PageContextCreatedClient & PageContextPublicClient;
type PageContextRouted = {
    pageId: string;
    routeParams: Record<string, string>;
};
type PageContextBegin = Awaited<ReturnType<typeof getPageContextBegin>>;
type RenderArgs = {
    scrollTarget: ScrollTarget;
    isBackwardNavigation?: boolean | null;
    isHistoryNavigation?: true;
    urlOriginal?: string;
    overwriteLastHistoryEntry?: boolean;
    pageContextsAborted?: PageContextAborted[];
    doNotRenderIfSamePage?: boolean;
    isClientSideNavigation?: boolean;
    pageContextInitClient?: Record<string, unknown>;
};
declare function renderPageClient(renderArgs: RenderArgs): Promise<({
    _pageFilesLoaded: import("../../shared-server-client/getPageFiles.js").PageFile[];
    urlOriginal?: string;
    urlPathname?: string;
    pageId: string;
    _globalContext: import("../shared/getGlobalContextClientInternalShared.js").GlobalContextClientInternalShared;
} & {
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: true;
    isPrerendering: false;
    urlOriginal: string;
    _urlHandler: null;
} & {
    _baseServer: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
} & {
    _globalContext: {
        _globalConfigPublic: {
            pages: {
                [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../types/index.js").ConfigResolved;
            _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        };
        pages: {
            [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../types/index.js").ConfigResolved;
        _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        isGlobalContext: true;
        _isOriginalObject: true;
        _virtualFileExportsGlobalEntry: unknown;
        _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & PageContextConfig & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: PreviousPageContext | null;
    pageContextsAborted: PageContextAborted[];
} & {
    _abortCall: `redirect(${string})` | `render(${string})` | "RenderErrorPage()";
    _abortCaller: "throw redirect()" | "throw render()" | "throw RenderErrorPage()";
} & {
    _abortCall: `redirect(${string})`;
    _abortCaller: "throw redirect()";
    _urlRedirect: import("../../shared-server-client/route/abort.js").UrlRedirect;
} & Omit<{
    _urlRedirect?: undefined;
    _urlRewrite?: undefined;
    abortStatusCode?: undefined;
}, "_urlRedirect"> & {
    urlPathname: string;
    _hasPageContextFromServer: boolean;
} & PageContextRouted) | ({
    _pageFilesLoaded: import("../../shared-server-client/getPageFiles.js").PageFile[];
    urlOriginal?: string;
    urlPathname?: string;
    pageId: string;
    _globalContext: import("../shared/getGlobalContextClientInternalShared.js").GlobalContextClientInternalShared;
} & {
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: true;
    isPrerendering: false;
    urlOriginal: string;
    _urlHandler: null;
} & {
    _baseServer: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
} & {
    _globalContext: {
        _globalConfigPublic: {
            pages: {
                [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../types/index.js").ConfigResolved;
            _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        };
        pages: {
            [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../types/index.js").ConfigResolved;
        _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        isGlobalContext: true;
        _isOriginalObject: true;
        _virtualFileExportsGlobalEntry: unknown;
        _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & PageContextConfig & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: PreviousPageContext | null;
    pageContextsAborted: PageContextAborted[];
} & {
    _abortCall: `redirect(${string})` | `render(${string})` | "RenderErrorPage()";
    _abortCaller: "throw redirect()" | "throw render()" | "throw RenderErrorPage()";
} & {
    _abortCall: `render(${string})` | `RenderErrorPage()`;
    _abortCaller: "throw render()" | "throw RenderErrorPage()";
    abortReason: undefined | unknown;
    _urlRewrite: string;
} & Omit<{
    _urlRedirect?: undefined;
    _urlRewrite?: undefined;
    abortStatusCode?: undefined;
}, "_urlRewrite"> & {
    urlPathname: string;
    _hasPageContextFromServer: boolean;
} & PageContextRouted) | ({
    _pageFilesLoaded: import("../../shared-server-client/getPageFiles.js").PageFile[];
    urlOriginal?: string;
    urlPathname?: string;
    pageId: string;
    _globalContext: import("../shared/getGlobalContextClientInternalShared.js").GlobalContextClientInternalShared;
} & {
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: true;
    isPrerendering: false;
    urlOriginal: string;
    _urlHandler: null;
} & {
    _baseServer: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
} & {
    _globalContext: {
        _globalConfigPublic: {
            pages: {
                [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../types/index.js").ConfigResolved;
            _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        };
        pages: {
            [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../types/index.js").ConfigResolved;
        _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        isGlobalContext: true;
        _isOriginalObject: true;
        _virtualFileExportsGlobalEntry: unknown;
        _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & PageContextConfig & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: PreviousPageContext | null;
    pageContextsAborted: PageContextAborted[];
} & {
    _abortCall: `redirect(${string})` | `render(${string})` | "RenderErrorPage()";
    _abortCaller: "throw redirect()" | "throw render()" | "throw RenderErrorPage()";
} & {
    _abortCall: `render(${string})` | `RenderErrorPage()`;
    _abortCaller: "throw render()" | "throw RenderErrorPage()";
    abortReason: undefined | unknown;
    abortStatusCode: import("../../shared-server-client/route/abort.js").AbortStatusCode;
} & Omit<{
    _urlRedirect?: undefined;
    _urlRewrite?: undefined;
    abortStatusCode?: undefined;
}, "abortStatusCode"> & {
    urlPathname: string;
    _hasPageContextFromServer: boolean;
} & PageContextRouted) | undefined>;
declare function getPageContextBegin(isForErrorPage: boolean, { urlOriginal, isBackwardNavigation, isHistoryNavigation, pageContextsAborted, isClientSideNavigation, pageContextInitClient, isFirstRender, }: {
    urlOriginal: string;
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    pageContextsAborted: PageContextAborted[];
    isClientSideNavigation: boolean;
    pageContextInitClient: Record<string, unknown> | undefined;
    isFirstRender: boolean;
}): Promise<{
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: true;
    isPrerendering: false;
    urlOriginal: string;
    _urlHandler: null;
} & {
    _baseServer: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
} & {
    _globalContext: {
        _globalConfigPublic: {
            pages: {
                [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../types/index.js").ConfigResolved;
            _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        };
        pages: {
            [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../types/index.js").ConfigResolved;
        _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        isGlobalContext: true;
        _isOriginalObject: true;
        _virtualFileExportsGlobalEntry: unknown;
        _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: import("../../shared-server-client/getPageFiles.js").PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: PreviousPageContext | null;
    pageContextsAborted: PageContextAborted[];
} & (PageContextAbort | null)>;
declare global {
    var _vike: VikeGlobalInternal;
}
declare function disableClientRouting(err: unknown, log: boolean): void;
declare function getRenderCount(): number;
/**
 * Get the `pageContext` object on the client-side.
 *
 * https://vike.dev/getPageContextClient
 */
declare function getPageContextClient(): PageContextClient | null;
