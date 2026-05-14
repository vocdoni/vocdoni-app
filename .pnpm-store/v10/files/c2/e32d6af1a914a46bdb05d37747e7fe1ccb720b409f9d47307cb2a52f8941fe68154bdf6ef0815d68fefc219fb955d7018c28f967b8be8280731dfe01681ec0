export { renderPageServerAfterRoute };
export { prerenderPage };
export { prerenderPageEntry };
export type { PageContextAfterRender };
import { type PageContextUrlInternal } from '../../../shared-server-client/getPageContextUrlComputed.js';
import { HttpResponse } from './createHttpResponse.js';
import { type PageContext_loadPageConfigsLazyServerSide, type PageConfigsLazy } from './loadPageConfigsLazyServerSide.js';
import type { PageContextCreatedServer } from './createPageContextServer.js';
import type { PageContextBegin } from '../renderPageServer.js';
import '../../assertEnvServer.js';
type PageContextAfterRender = {
    httpResponse: HttpResponse;
    errorWhileRendering: null | Error;
};
declare function renderPageServerAfterRoute<PageContext extends {
    pageId: string;
    _pageContextAlreadyProvidedByOnPrerenderHook?: true;
    is404: null | boolean;
    routeParams: Record<string, string>;
    errorWhileRendering: null | Error;
    _requestId: number;
} & PageContextCreatedServer & PageContextBegin & PageContextUrlInternal & PageContext_loadPageConfigsLazyServerSide>(pageContext: PageContext): Promise<PageContext & PageContextAfterRender>;
declare function prerenderPage(pageContext: Parameters<typeof prerenderPageEntry>[0]): Promise<{
    documentHtml: string;
    pageContextSerialized: null;
    pageContext: {
        _isOriginalObject: true;
        isPageContext: true;
    } & {
        isClientSide: false;
        isPrerendering: boolean;
        _requestId: number;
    } & import("../renderPageServer.js").PageContextInit & {
        _reqDev?: import("http").IncomingMessage;
        _reqWeb?: Request;
    } & {
        _globalContext: ({
            _globalConfigPublic: {
                pages: {
                    [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
                };
                config: import("../../../types/index.js").ConfigResolved;
                _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
                _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
                _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            };
            pages: {
                [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../../types/index.js").ConfigResolved;
            _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            isGlobalContext: true;
            _isOriginalObject: true;
            _virtualFileExportsGlobalEntry: unknown;
            _pageFilesAll: import("../../__internal/index.js").PageFile[];
            _pageConfigs: import("../../__internal/index.js").PageConfig[];
            _pageConfigGlobal: import("../../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & (({
            _isProduction: false;
            _isPrerendering: false;
            assetsManifest: null;
            _viteDevServer: import("vite").ViteDevServer | undefined;
            viteConfig: import("vite").ResolvedConfig | undefined;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: true;
            viteConfig: import("vite").ResolvedConfig;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: false;
            viteConfig: null;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        }) & {
            baseServer: string;
            baseAssets: string;
            viteConfigRuntime: {
                root: string;
                build: {
                    outDir: string;
                };
                _baseViteOriginal: string;
                vitePluginServerEntry: {
                    inject: boolean | undefined;
                };
            };
        })) & {
            prerenderContext: import("../../../types/index.js").PrerenderContext | undefined;
        };
        _pageFilesAll: import("../../__internal/index.js").PageFile[];
        _baseServer: string;
        _baseAssets: string;
        _pageContextInit: import("../renderPageServer.js").PageContextInit & {
            _reqDev?: import("http").IncomingMessage;
            _reqWeb?: Request;
        } & {
            headers?: Record<string, unknown>;
        };
        _urlHandler: ((url: string) => string) | null;
        isClientSideNavigation: boolean;
    } & {
        pages: {
            [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../../types/index.js").ConfigResolved;
        _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    } & {
        urlParsed: import("../../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    } & {
        headers: Record<string, string> | null;
    } & import("../../../shared-server-client/route/index.js").PageContextAfterRoute & {
        is404: boolean | null;
        pageId: string;
    } & {
        _pageConfig: import("../../__internal/index.js").PageConfig | null;
    } & import("../../../shared-server-client/getPageFiles.js").PageContextConfig & {
        _pageConfig: null | import("../../__internal/index.js").PageConfig;
    } & {
        cspNonce: string | null;
    } & {
        Page: unknown;
        _isHtmlOnly: boolean;
        _passToClient: import("./html/serializeContext.js").PassToClient;
    } & {
        headersResponse: Headers;
    } & {
        __getPageAssets: () => Promise<import("./getPageAssets.js").PageAsset[]>;
    } & {
        routeParams: Record<string, string>;
        pageId: string;
        _requestId: number;
        _usesClientRouter: boolean;
        _pageContextAlreadyProvidedByOnPrerenderHook?: true;
        is404: boolean;
    } & {
        _isPageContextJsonRequest: null;
        pageContextsAborted: never[];
    };
} | {
    documentHtml: string;
    pageContextSerialized: string;
    pageContext: {
        _isOriginalObject: true;
        isPageContext: true;
    } & {
        isClientSide: false;
        isPrerendering: boolean;
        _requestId: number;
    } & import("../renderPageServer.js").PageContextInit & {
        _reqDev?: import("http").IncomingMessage;
        _reqWeb?: Request;
    } & {
        _globalContext: ({
            _globalConfigPublic: {
                pages: {
                    [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
                };
                config: import("../../../types/index.js").ConfigResolved;
                _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
                _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
                _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            };
            pages: {
                [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../../types/index.js").ConfigResolved;
            _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            isGlobalContext: true;
            _isOriginalObject: true;
            _virtualFileExportsGlobalEntry: unknown;
            _pageFilesAll: import("../../__internal/index.js").PageFile[];
            _pageConfigs: import("../../__internal/index.js").PageConfig[];
            _pageConfigGlobal: import("../../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & (({
            _isProduction: false;
            _isPrerendering: false;
            assetsManifest: null;
            _viteDevServer: import("vite").ViteDevServer | undefined;
            viteConfig: import("vite").ResolvedConfig | undefined;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: true;
            viteConfig: import("vite").ResolvedConfig;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: false;
            viteConfig: null;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        }) & {
            baseServer: string;
            baseAssets: string;
            viteConfigRuntime: {
                root: string;
                build: {
                    outDir: string;
                };
                _baseViteOriginal: string;
                vitePluginServerEntry: {
                    inject: boolean | undefined;
                };
            };
        })) & {
            prerenderContext: import("../../../types/index.js").PrerenderContext | undefined;
        };
        _pageFilesAll: import("../../__internal/index.js").PageFile[];
        _baseServer: string;
        _baseAssets: string;
        _pageContextInit: import("../renderPageServer.js").PageContextInit & {
            _reqDev?: import("http").IncomingMessage;
            _reqWeb?: Request;
        } & {
            headers?: Record<string, unknown>;
        };
        _urlHandler: ((url: string) => string) | null;
        isClientSideNavigation: boolean;
    } & {
        pages: {
            [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../../types/index.js").ConfigResolved;
        _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    } & {
        urlParsed: import("../../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    } & {
        headers: Record<string, string> | null;
    } & import("../../../shared-server-client/route/index.js").PageContextAfterRoute & {
        is404: boolean | null;
        pageId: string;
    } & {
        _pageConfig: import("../../__internal/index.js").PageConfig | null;
    } & import("../../../shared-server-client/getPageFiles.js").PageContextConfig & {
        _pageConfig: null | import("../../__internal/index.js").PageConfig;
    } & {
        cspNonce: string | null;
    } & {
        Page: unknown;
        _isHtmlOnly: boolean;
        _passToClient: import("./html/serializeContext.js").PassToClient;
    } & {
        headersResponse: Headers;
    } & {
        __getPageAssets: () => Promise<import("./getPageAssets.js").PageAsset[]>;
    } & {
        routeParams: Record<string, string>;
        pageId: string;
        _requestId: number;
        _usesClientRouter: boolean;
        _pageContextAlreadyProvidedByOnPrerenderHook?: true;
        is404: boolean;
    } & {
        _isPageContextJsonRequest: null;
        pageContextsAborted: never[];
    };
}>;
declare function prerenderPageEntry(pageContext: PageContextCreatedServer & PageConfigsLazy & {
    routeParams: Record<string, string>;
    pageId: string;
    _requestId: number;
    _usesClientRouter: boolean;
    _pageContextAlreadyProvidedByOnPrerenderHook?: true;
    is404: boolean;
}): Promise<{
    documentHtml: string;
    pageContextSerialized: null;
    pageContext: {
        _isOriginalObject: true;
        isPageContext: true;
    } & {
        isClientSide: false;
        isPrerendering: boolean;
        _requestId: number;
    } & import("../renderPageServer.js").PageContextInit & {
        _reqDev?: import("http").IncomingMessage;
        _reqWeb?: Request;
    } & {
        _globalContext: ({
            _globalConfigPublic: {
                pages: {
                    [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
                };
                config: import("../../../types/index.js").ConfigResolved;
                _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
                _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
                _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            };
            pages: {
                [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../../types/index.js").ConfigResolved;
            _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            isGlobalContext: true;
            _isOriginalObject: true;
            _virtualFileExportsGlobalEntry: unknown;
            _pageFilesAll: import("../../__internal/index.js").PageFile[];
            _pageConfigs: import("../../__internal/index.js").PageConfig[];
            _pageConfigGlobal: import("../../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & (({
            _isProduction: false;
            _isPrerendering: false;
            assetsManifest: null;
            _viteDevServer: import("vite").ViteDevServer | undefined;
            viteConfig: import("vite").ResolvedConfig | undefined;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: true;
            viteConfig: import("vite").ResolvedConfig;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: false;
            viteConfig: null;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        }) & {
            baseServer: string;
            baseAssets: string;
            viteConfigRuntime: {
                root: string;
                build: {
                    outDir: string;
                };
                _baseViteOriginal: string;
                vitePluginServerEntry: {
                    inject: boolean | undefined;
                };
            };
        })) & {
            prerenderContext: import("../../../types/index.js").PrerenderContext | undefined;
        };
        _pageFilesAll: import("../../__internal/index.js").PageFile[];
        _baseServer: string;
        _baseAssets: string;
        _pageContextInit: import("../renderPageServer.js").PageContextInit & {
            _reqDev?: import("http").IncomingMessage;
            _reqWeb?: Request;
        } & {
            headers?: Record<string, unknown>;
        };
        _urlHandler: ((url: string) => string) | null;
        isClientSideNavigation: boolean;
    } & {
        pages: {
            [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../../types/index.js").ConfigResolved;
        _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    } & {
        urlParsed: import("../../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    } & {
        headers: Record<string, string> | null;
    } & import("../../../shared-server-client/route/index.js").PageContextAfterRoute & {
        is404: boolean | null;
        pageId: string;
    } & {
        _pageConfig: import("../../__internal/index.js").PageConfig | null;
    } & import("../../../shared-server-client/getPageFiles.js").PageContextConfig & {
        _pageConfig: null | import("../../__internal/index.js").PageConfig;
    } & {
        cspNonce: string | null;
    } & {
        Page: unknown;
        _isHtmlOnly: boolean;
        _passToClient: import("./html/serializeContext.js").PassToClient;
    } & {
        headersResponse: Headers;
    } & {
        __getPageAssets: () => Promise<import("./getPageAssets.js").PageAsset[]>;
    } & {
        routeParams: Record<string, string>;
        pageId: string;
        _requestId: number;
        _usesClientRouter: boolean;
        _pageContextAlreadyProvidedByOnPrerenderHook?: true;
        is404: boolean;
    } & {
        _isPageContextJsonRequest: null;
        pageContextsAborted: never[];
    };
} | {
    documentHtml: string;
    pageContextSerialized: string;
    pageContext: {
        _isOriginalObject: true;
        isPageContext: true;
    } & {
        isClientSide: false;
        isPrerendering: boolean;
        _requestId: number;
    } & import("../renderPageServer.js").PageContextInit & {
        _reqDev?: import("http").IncomingMessage;
        _reqWeb?: Request;
    } & {
        _globalContext: ({
            _globalConfigPublic: {
                pages: {
                    [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
                };
                config: import("../../../types/index.js").ConfigResolved;
                _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
                _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
                _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            };
            pages: {
                [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
            };
            config: import("../../../types/index.js").ConfigResolved;
            _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
            _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
            _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
            isGlobalContext: true;
            _isOriginalObject: true;
            _virtualFileExportsGlobalEntry: unknown;
            _pageFilesAll: import("../../__internal/index.js").PageFile[];
            _pageConfigs: import("../../__internal/index.js").PageConfig[];
            _pageConfigGlobal: import("../../../types/PageConfig.js").PageConfigGlobalRuntime;
            _allPageIds: string[];
        } & (({
            _isProduction: false;
            _isPrerendering: false;
            assetsManifest: null;
            _viteDevServer: import("vite").ViteDevServer | undefined;
            viteConfig: import("vite").ResolvedConfig | undefined;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: true;
            viteConfig: import("vite").ResolvedConfig;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        } | {
            _isPrerendering: false;
            viteConfig: null;
            _isProduction: true;
            assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
            _viteDevServer: null;
            _usesClientRouter: boolean;
            isClientSide: false;
            _pageRoutes: import("../../__internal/index.js").PageRoutes;
            _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
        }) & {
            baseServer: string;
            baseAssets: string;
            viteConfigRuntime: {
                root: string;
                build: {
                    outDir: string;
                };
                _baseViteOriginal: string;
                vitePluginServerEntry: {
                    inject: boolean | undefined;
                };
            };
        })) & {
            prerenderContext: import("../../../types/index.js").PrerenderContext | undefined;
        };
        _pageFilesAll: import("../../__internal/index.js").PageFile[];
        _baseServer: string;
        _baseAssets: string;
        _pageContextInit: import("../renderPageServer.js").PageContextInit & {
            _reqDev?: import("http").IncomingMessage;
            _reqWeb?: Request;
        } & {
            headers?: Record<string, unknown>;
        };
        _urlHandler: ((url: string) => string) | null;
        isClientSideNavigation: boolean;
    } & {
        pages: {
            [k: string]: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../../../types/index.js").ConfigResolved;
        _source: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("../../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
    } & {
        urlParsed: import("../../../utils/parseUrl.js").UrlPublic;
        urlPathname: string;
        url: string;
    } & {
        headers: Record<string, string> | null;
    } & import("../../../shared-server-client/route/index.js").PageContextAfterRoute & {
        is404: boolean | null;
        pageId: string;
    } & {
        _pageConfig: import("../../__internal/index.js").PageConfig | null;
    } & import("../../../shared-server-client/getPageFiles.js").PageContextConfig & {
        _pageConfig: null | import("../../__internal/index.js").PageConfig;
    } & {
        cspNonce: string | null;
    } & {
        Page: unknown;
        _isHtmlOnly: boolean;
        _passToClient: import("./html/serializeContext.js").PassToClient;
    } & {
        headersResponse: Headers;
    } & {
        __getPageAssets: () => Promise<import("./getPageAssets.js").PageAsset[]>;
    } & {
        routeParams: Record<string, string>;
        pageId: string;
        _requestId: number;
        _usesClientRouter: boolean;
        _pageContextAlreadyProvidedByOnPrerenderHook?: true;
        is404: boolean;
    } & {
        _isPageContextJsonRequest: null;
        pageContextsAborted: never[];
    };
}>;
