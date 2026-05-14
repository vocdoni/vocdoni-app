export { createPageContextServer };
export { createPageContextServerWithoutGlobalContext };
export type { PageContextCreatedServer };
export type { PageContextCreatedServerWithoutGlobalContext };
import type { GlobalContextServerInternal } from '../globalContext.js';
import type { PageContextInit, PageContextInitInternal } from '../renderPageServer.js';
import '../../assertEnvServer.js';
type PageContextCreatedServer = Awaited<ReturnType<typeof createPageContextServer>>;
declare function createPageContextServer(pageContextInit: PageContextInitInternal & {
    headers?: Record<string, unknown>;
}, globalContext: GlobalContextServerInternal, args: {
    requestId: number;
} & ({
    isPrerendering: true;
} | {
    isPrerendering: false;
    urlHandler: null | ((url: string) => string);
    isClientSideNavigation: boolean;
})): {
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: false;
    isPrerendering: boolean;
    _requestId: number;
} & PageContextInit & {
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
    _pageContextInit: PageContextInit & {
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
};
type PageContextCreatedServerWithoutGlobalContext = ReturnType<typeof createPageContextServerWithoutGlobalContext>;
/** Use this as last resort — prefer passing richer `pageContext` objects to the runtime logger */
declare function createPageContextServerWithoutGlobalContext(pageContextInit: PageContextInit, requestId: number): {
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: false;
    isPrerendering: boolean;
    _requestId: number;
} & PageContextInit & {
    _reqDev?: import("http").IncomingMessage;
    _reqWeb?: Request;
};
