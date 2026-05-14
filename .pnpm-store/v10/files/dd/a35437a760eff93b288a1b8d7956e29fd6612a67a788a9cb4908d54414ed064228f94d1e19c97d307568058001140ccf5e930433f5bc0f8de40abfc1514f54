export { getPageContextFromHooksClient };
export { getPageContextFromHooksClient_firstRender };
export { getPageContextFromHooksServer };
export { getPageContextFromHooksServer_firstRender };
export { setPageContextInitIsPassedToClient };
export type { PageContextFromHooksServer };
import type { PageContextConfig, PageFile } from '../../shared-server-client/getPageFiles.js';
import type { PageContextCreatedClient } from './createPageContextClient.js';
import type { PageContextBegin } from './renderPageClient.js';
import { type PageContextPublicClient } from './getPageContextPublicClient.js';
import '../assertEnvClient.js';
type PageContextSerialized = {
    pageId: string;
    _hasPageContextFromServer: true;
};
declare function getPageContextFromHooksServer_firstRender(): PageContextSerialized & {
    routeParams: Record<string, string>;
    _hasPageContextFromServer: true;
};
declare function getPageContextFromHooksClient_firstRender(pageContext: PageContextSerialized & PageContextBegin & PageContextConfig & {
    _hasPageContextFromServer: true;
} & PageContextPublicClient): Promise<((PageContextSerialized & ({
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
        _pageFilesAll: PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: ({
        pageId: string;
    } & PageContextConfig & {
        pageId: string;
        routeParams: Record<string, string>;
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
            _pageFilesAll: PageFile[];
            _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
            _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & {
            isClientSide: true;
        } & {
            _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
            _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
        };
        _pageFilesAll: PageFile[];
    } & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & import("../../shared-server-client/createPageContextShared.js").PageContextCreated & Omit<Partial<PageContextConfig & {
        isPageContext: true;
        Page: import("../../types/Config.js").Config["Page"];
        routeParams: Record<string, string>;
        data: unknown;
        headersResponse: Headers;
        is404: boolean | null;
        isClientSideNavigation: boolean;
        abortReason?: unknown;
        abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
        errorWhileRendering?: unknown;
        pageId: string | null;
        from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        pageExports: Record<string, unknown>;
        isBaseMissing?: true;
    }> & Pick<PageContextConfig & {
        isPageContext: true;
        Page: import("../../types/Config.js").Config["Page"];
        routeParams: Record<string, string>;
        data: unknown;
        headersResponse: Headers;
        is404: boolean | null;
        isClientSideNavigation: boolean;
        abortReason?: unknown;
        abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
        errorWhileRendering?: unknown;
        pageId: string | null;
        from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        pageExports: Record<string, unknown>;
        isBaseMissing?: true;
    }, "config" | "pageId" | "exports" | "Page" | "data" | "source" | "sources" | "from" | "configEntries" | "exportsAll" | "pageExports" | "routeParams" | "abortReason"> & {
        isClientSide: true;
        isPrerendering: false;
        cspNonce?: undefined;
        headers?: undefined;
    } & {
        urlOriginal: string;
        isHydration: boolean;
        isBackwardNavigation: boolean | null;
        isHistoryNavigation: boolean;
        previousPageContext: import("../../types/PageContext.js").PageContextClient<unknown> | null;
        pageContextsAborted: Partial<import("../../types/PageContext.js").PageContextClient<unknown>>[];
        globalContext: import("../../types/GlobalContext.js").GlobalContextClient;
    } & {
        urlOriginal: string;
    } & {
        urlParsed: import("../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    }, ("globalContext" | "Page" | "data") | "previousPageContext" | "pageContextsAborted"> & {
        previousPageContext: {
            pageId: string;
        } | null;
    } & {
        urlOriginal: string;
    }) | null;
    pageContextsAborted: import("../../shared-server-client/route/abort.js").PageContextAborted[];
} & (import("../../shared-server-client/route/abort.js").PageContextAbort | null))) & PageContextConfig & {
    _hasPageContextFromServer: true;
}) & import("../../shared-server-client/createPageContextShared.js").PageContextCreated & Omit<Partial<PageContextConfig & {
    isPageContext: true;
    Page: import("../../types/Config.js").Config["Page"];
    routeParams: Record<string, string>;
    data: unknown;
    headersResponse: Headers;
    is404: boolean | null;
    isClientSideNavigation: boolean;
    abortReason?: unknown;
    abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
    errorWhileRendering?: unknown;
    pageId: string | null;
    from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
    sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
    pageExports: Record<string, unknown>;
    isBaseMissing?: true;
}> & Pick<PageContextConfig & {
    isPageContext: true;
    Page: import("../../types/Config.js").Config["Page"];
    routeParams: Record<string, string>;
    data: unknown;
    headersResponse: Headers;
    is404: boolean | null;
    isClientSideNavigation: boolean;
    abortReason?: unknown;
    abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
    errorWhileRendering?: unknown;
    pageId: string | null;
    from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
    sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
    pageExports: Record<string, unknown>;
    isBaseMissing?: true;
}, "config" | "pageId" | "exports" | "Page" | "data" | "source" | "sources" | "from" | "configEntries" | "exportsAll" | "pageExports" | "routeParams" | "abortReason"> & {
    isClientSide: true;
    isPrerendering: false;
    cspNonce?: undefined;
    headers?: undefined;
} & {
    urlOriginal: string;
    isHydration: boolean;
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    previousPageContext: import("../../types/PageContext.js").PageContextClient<unknown> | null;
    pageContextsAborted: Partial<import("../../types/PageContext.js").PageContextClient<unknown>>[];
    globalContext: import("../../types/GlobalContext.js").GlobalContextClient;
} & {
    urlOriginal: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
}, ("globalContext" | "Page" | "data") | "previousPageContext" | "pageContextsAborted"> & {
    previousPageContext: {
        pageId: string;
    } | null;
} & {
    urlOriginal: string;
}>;
type PageContextFromHooksServer = {
    _hasPageContextFromServer: boolean;
};
declare function getPageContextFromHooksServer(pageContext: {
    pageId: string;
} & PageContextCreatedClient, isErrorPage: boolean): Promise<{
    is404ServerSideRouted: true;
} | {
    is404ServerSideRouted?: undefined;
    pageContextFromHooksServer: PageContextFromHooksServer;
}>;
declare function getPageContextFromHooksClient(pageContext: {
    pageId: string;
    _hasPageContextFromServer: boolean;
} & PageContextBegin & PageContextConfig & PageContextPublicClient, isErrorPage: boolean): Promise<({
    pageId: string;
    _hasPageContextFromServer: boolean;
} & (({
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
        _pageFilesAll: PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & {
        isClientSide: true;
    } & {
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    };
    _pageFilesAll: PageFile[];
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & {
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    isClientSideNavigation: boolean;
    isHydration: boolean;
    previousPageContext: ({
        pageId: string;
    } & PageContextConfig & {
        pageId: string;
        routeParams: Record<string, string>;
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
            _pageFilesAll: PageFile[];
            _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
            _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & {
            isClientSide: true;
        } & {
            _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
            _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
        };
        _pageFilesAll: PageFile[];
    } & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic & import("../../shared-server-client/createPageContextShared.js").PageContextCreated & Omit<Partial<PageContextConfig & {
        isPageContext: true;
        Page: import("../../types/Config.js").Config["Page"];
        routeParams: Record<string, string>;
        data: unknown;
        headersResponse: Headers;
        is404: boolean | null;
        isClientSideNavigation: boolean;
        abortReason?: unknown;
        abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
        errorWhileRendering?: unknown;
        pageId: string | null;
        from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        pageExports: Record<string, unknown>;
        isBaseMissing?: true;
    }> & Pick<PageContextConfig & {
        isPageContext: true;
        Page: import("../../types/Config.js").Config["Page"];
        routeParams: Record<string, string>;
        data: unknown;
        headersResponse: Headers;
        is404: boolean | null;
        isClientSideNavigation: boolean;
        abortReason?: unknown;
        abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
        errorWhileRendering?: unknown;
        pageId: string | null;
        from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
        source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        pageExports: Record<string, unknown>;
        isBaseMissing?: true;
    }, "config" | "pageId" | "exports" | "Page" | "data" | "source" | "sources" | "from" | "configEntries" | "exportsAll" | "pageExports" | "routeParams" | "abortReason"> & {
        isClientSide: true;
        isPrerendering: false;
        cspNonce?: undefined;
        headers?: undefined;
    } & {
        urlOriginal: string;
        isHydration: boolean;
        isBackwardNavigation: boolean | null;
        isHistoryNavigation: boolean;
        previousPageContext: import("../../types/PageContext.js").PageContextClient<unknown> | null;
        pageContextsAborted: Partial<import("../../types/PageContext.js").PageContextClient<unknown>>[];
        globalContext: import("../../types/GlobalContext.js").GlobalContextClient;
    } & {
        urlOriginal: string;
    } & {
        urlParsed: import("../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    }, ("globalContext" | "Page" | "data") | "previousPageContext" | "pageContextsAborted"> & {
        previousPageContext: {
            pageId: string;
        } | null;
    } & {
        urlOriginal: string;
    }) | null;
    pageContextsAborted: import("../../shared-server-client/route/abort.js").PageContextAborted[];
} & (import("../../shared-server-client/route/abort.js").PageContextAbort | null)) & PageContextConfig)) & import("../../shared-server-client/createPageContextShared.js").PageContextCreated & Omit<Partial<PageContextConfig & {
    isPageContext: true;
    Page: import("../../types/Config.js").Config["Page"];
    routeParams: Record<string, string>;
    data: unknown;
    headersResponse: Headers;
    is404: boolean | null;
    isClientSideNavigation: boolean;
    abortReason?: unknown;
    abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
    errorWhileRendering?: unknown;
    pageId: string | null;
    from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
    sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
    pageExports: Record<string, unknown>;
    isBaseMissing?: true;
}> & Pick<PageContextConfig & {
    isPageContext: true;
    Page: import("../../types/Config.js").Config["Page"];
    routeParams: Record<string, string>;
    data: unknown;
    headersResponse: Headers;
    is404: boolean | null;
    isClientSideNavigation: boolean;
    abortReason?: unknown;
    abortStatusCode?: import("../../shared-server-client/route/abort.js").AbortStatusCode;
    errorWhileRendering?: unknown;
    pageId: string | null;
    from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
    sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
    pageExports: Record<string, unknown>;
    isBaseMissing?: true;
}, "config" | "pageId" | "exports" | "Page" | "data" | "source" | "sources" | "from" | "configEntries" | "exportsAll" | "pageExports" | "routeParams" | "abortReason"> & {
    isClientSide: true;
    isPrerendering: false;
    cspNonce?: undefined;
    headers?: undefined;
} & {
    urlOriginal: string;
    isHydration: boolean;
    isBackwardNavigation: boolean | null;
    isHistoryNavigation: boolean;
    previousPageContext: import("../../types/PageContext.js").PageContextClient<unknown> | null;
    pageContextsAborted: Partial<import("../../types/PageContext.js").PageContextClient<unknown>>[];
    globalContext: import("../../types/GlobalContext.js").GlobalContextClient;
} & {
    urlOriginal: string;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
}, ("globalContext" | "Page" | "data") | "previousPageContext" | "pageContextsAborted"> & {
    previousPageContext: {
        pageId: string;
    } | null;
} & {
    urlOriginal: string;
}>;
declare function setPageContextInitIsPassedToClient(pageContext: Record<string, unknown>): void;
