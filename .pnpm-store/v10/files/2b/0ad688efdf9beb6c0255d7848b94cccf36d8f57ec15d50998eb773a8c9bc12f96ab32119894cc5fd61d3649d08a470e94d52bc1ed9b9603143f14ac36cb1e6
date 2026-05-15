export { renderPageServer };
export { getRequestTag };
export type { PageContextInit };
export type { PageContextInitInternal };
export type { PageContextBegin };
export type { RequestTag };
import { type PageContextAborted } from '../../shared-server-client/route/abort.js';
import { type GlobalContextServerInternal } from './globalContext.js';
import { type HttpResponse } from './renderPageServer/createHttpResponse.js';
import type { PageContextServer } from '../../types/index.js';
import type { PageContextInit, PageContextInitInternal } from '../../types/PageContext.js';
import { type AsyncStore } from './asyncHook.js';
import '../assertEnvServer.js';
type PageContextBegin = ReturnType<typeof getPageContextBegin>;
declare function renderPageServer<PageContextUserAdded extends {}, PageContextInitUser extends PageContextInitInternal>(pageContextInit: PageContextInitUser): Promise<PageContextInitUser & {
    httpResponse: HttpResponse;
} & Partial<PageContextServer & PageContextUserAdded>>;
declare function getPageContextBegin(pageContextInit: PageContextInitInternal, globalContext: GlobalContextServerInternal, requestId: number, asyncStore: AsyncStore): {
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
        _pageFilesAll: import("../__internal/index.js").PageFile[];
        _pageConfigs: import("../__internal/index.js").PageConfig[];
        _pageConfigGlobal: import("../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & (({
        _isProduction: false;
        _isPrerendering: false;
        assetsManifest: null;
        _viteDevServer: import("vite").ViteDevServer | undefined;
        viteConfig: import("vite").ResolvedConfig | undefined;
        isClientSide: false;
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    } | {
        _isPrerendering: true;
        viteConfig: import("vite").ResolvedConfig;
        _isProduction: true;
        assetsManifest: import("../../types/ViteManifest.js").ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
    } | {
        _isPrerendering: false;
        viteConfig: null;
        _isProduction: true;
        assetsManifest: import("../../types/ViteManifest.js").ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: import("../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../shared-server-client/hooks/getHook.js").HookInternal | null;
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
        prerenderContext: import("../../types/index.js").PrerenderContext | undefined;
    };
    _pageFilesAll: import("../__internal/index.js").PageFile[];
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
        [k: string]: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
    };
    config: import("../../types/index.js").ConfigResolved;
    _source: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Source;
    _sources: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").Sources;
    _from: import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").From;
} & {
    urlParsed: import("../../utils/parseUrl.js").UrlPublic;
    urlPathname: string;
    url: string;
} & {
    headers: Record<string, string> | null;
} & {
    _requestId: number;
    _asyncStore: AsyncStore;
    _isPageContextJsonRequest: boolean;
    pageContextsAborted: PageContextAborted[];
};
type RequestTag = ReturnType<typeof getRequestTag>;
declare function getRequestTag(requestId: number): `request-${number}`;
