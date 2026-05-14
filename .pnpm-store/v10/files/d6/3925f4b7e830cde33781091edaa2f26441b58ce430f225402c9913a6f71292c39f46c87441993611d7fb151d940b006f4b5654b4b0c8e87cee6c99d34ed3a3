export { loadPageConfigsLazyServerSide };
export type { PageContext_loadPageConfigsLazyServerSide };
export type { PageConfigsLazy };
export type { PageContextAfterPageEntryLoaded };
import { type PageContextConfig } from '../../../shared-server-client/getPageFiles.js';
import { PromiseType } from '../../../utils/PromiseType.js';
import { type PageAsset } from './getPageAssets.js';
import type { PageConfigRuntime } from '../../../types/PageConfig.js';
import type { PassToClient } from './html/serializeContext.js';
import type { PageContextAfterRoute } from '../../../shared-server-client/route/index.js';
import type { PageContextCreatedServer } from './createPageContextServer.js';
import '../../assertEnvServer.js';
type PageContext_loadPageConfigsLazyServerSide = PageContextCreatedServer & PageContextAfterRoute & {
    is404: boolean | null;
    pageId: string;
};
type PageConfigsLazy = PromiseType<ReturnType<typeof loadPageConfigsLazyServerSide>>;
declare function loadPageConfigsLazyServerSide(pageContext: PageContext_loadPageConfigsLazyServerSide): Promise<{
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
        _pageFilesAll: import("../../../shared-server-client/getPageFiles.js").PageFile[];
        _pageConfigs: PageConfigRuntime[];
        _pageConfigGlobal: import("../../../types/PageConfig.js").PageConfigGlobalRuntime;
        _allPageIds: string[];
    } & (({
        _isProduction: false;
        _isPrerendering: false;
        assetsManifest: null;
        _viteDevServer: import("vite").ViteDevServer | undefined;
        viteConfig: import("vite").ResolvedConfig | undefined;
        isClientSide: false;
        _pageRoutes: import("../../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
    } | {
        _isPrerendering: true;
        viteConfig: import("vite").ResolvedConfig;
        _isProduction: true;
        assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: import("../../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
        _onBeforeRouteHook: import("../../../shared-server-client/hooks/getHook.js").HookInternal | null;
    } | {
        _isPrerendering: false;
        viteConfig: null;
        _isProduction: true;
        assetsManifest: import("../../../types/ViteManifest.js").ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: import("../../../shared-server-client/route/loadPageRoutes.js").PageRoutes;
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
    _pageFilesAll: import("../../../shared-server-client/getPageFiles.js").PageFile[];
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
} & PageContextAfterRoute & {
    is404: boolean | null;
    pageId: string;
} & {
    _pageConfig: PageConfigRuntime | null;
} & PageContextConfig & {
    _pageConfig: null | PageConfigRuntime;
} & {
    cspNonce: string | null;
} & {
    Page: unknown;
    _isHtmlOnly: boolean;
    _passToClient: PassToClient;
} & {
    headersResponse: Headers;
} & {
    __getPageAssets: () => Promise<PageAsset[]>;
}>;
type PageContextAfterPageEntryLoaded = PageContext_loadPageConfigsLazyServerSide & {
    _pageConfig: null | PageConfigRuntime;
} & PageContextConfig;
