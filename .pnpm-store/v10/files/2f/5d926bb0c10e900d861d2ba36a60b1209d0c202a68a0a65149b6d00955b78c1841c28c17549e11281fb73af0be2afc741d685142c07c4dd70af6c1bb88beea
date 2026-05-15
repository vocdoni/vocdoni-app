export { runPrerender };
export type { PrerenderOptions };
export type { PrerenderContextPublic };
export type { PrerenderTrigger };
import type { PageFile } from '../../shared-server-client/getPageFiles.js';
import { type GlobalContextServerInternal } from '../../server/runtime/globalContext.js';
import type { ApiOptions } from '../api/types.js';
type ProvidedByHook = null | {
    hookFilePath: string;
    hookName: 'onBeforePrerenderStart' | 'prerender';
};
type ProvidedByHookTransformer = null | {
    hookFilePath: string;
    hookName: 'onPrerenderStart' | 'onBeforePrerender';
};
type PageContextPrerendered = {
    urlOriginal: string;
    _providedByHook?: ProvidedByHook;
    pageId: string | null;
    isRedirect?: true;
    is404: boolean;
};
type PrerenderedPageContexts = Record<string, PageContextPrerendered>;
type PrerenderContextPublic = Pick<PrerenderContext, 'pageContexts' | 'output'>;
type PrerenderContext = {
    pageContexts: PageContext[];
    output: Output;
    _pageContextInit: Record<string, unknown> | null;
    _noExtraDir: boolean | null;
    _prerenderedPageContexts: PrerenderedPageContexts;
    _requestIdCounter: number;
    _userRootDir: string;
    _outDirClient: string;
};
type Output<PageContext = PageContextPrerendered> = {
    filePath: string;
    fileType: FileType;
    fileContent: string;
    pageContext: PageContext;
}[];
type FileType = 'HTML' | 'JSON';
type PageContext = Awaited<ReturnType<typeof createPageContextPrerendering>> & {
    _urlOriginalBeforeHook?: string;
};
type PrerenderOptions = ApiOptions & {
    /** Initial `pageContext` values */
    pageContextInit?: Record<string, unknown>;
    /** @experimental Don't use without having talked to a vike maintainer. */
    onPagePrerender?: Function;
    /** @deprecated Define `prerender({ viteConfig: { root }})` instead. */
    root?: string;
    /** @deprecated Define `prerender({ viteConfig: { configFile }})` instead. */
    configFile?: string;
    /** @deprecated Define `partial` in vite.config.js instead, see https://vike.dev/prerender */
    partial?: boolean;
    /** @deprecated Define `noExtraDir` in vite.config.js instead, see https://vike.dev/prerender */
    noExtraDir?: boolean;
    /** @deprecated Define `parallel` in vite.config.js instead, see https://vike.dev/prerender */
    parallel?: number;
    /** @deprecated */
    outDir?: string;
    /** @deprecated */
    base?: string;
};
type PrerenderTrigger = '$ vike prerender' | 'prerender()' | 'auto-run';
declare function runPrerender(options: PrerenderOptions | undefined, trigger: PrerenderTrigger): Promise<void>;
declare function createPageContextPrerendering(urlOriginal: string, prerenderContext: PrerenderContext, globalContext: GlobalContextServerInternal, is404: boolean, pageId: string | undefined, providedByHook: ProvidedByHook): Promise<{
    _isOriginalObject: true;
    isPageContext: true;
} & {
    isClientSide: false;
    isPrerendering: boolean;
    _requestId: number;
} & import("../../types/PageContext.js").PageContextInit & {
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
        _pageFilesAll: PageFile[];
        _pageConfigs: import("../../types/PageConfig.js").PageConfigRuntime[];
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
        prerenderContext: PrerenderContextPublic | undefined;
    };
    _pageFilesAll: PageFile[];
    _baseServer: string;
    _baseAssets: string;
    _pageContextInit: import("../../types/PageContext.js").PageContextInit & {
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
    _urlHandler: null;
    _requestId: number;
    _noExtraDir: boolean | null;
    _prerenderContext: PrerenderContext;
    _providedByHook: ProvidedByHook;
    _urlOriginalModifiedByHook: ProvidedByHookTransformer;
    is404: boolean;
} & {
    pageId: string;
    routeParams: {};
} & import("../../shared-server-client/route/index.js").PageContextAfterRoute & {
    is404: boolean | null;
    pageId: string;
} & {
    _pageConfig: import("../../types/PageConfig.js").PageConfigRuntime | null;
} & import("../../shared-server-client/getPageFiles.js").PageContextConfig & {
    _pageConfig: null | import("../../types/PageConfig.js").PageConfigRuntime;
} & {
    cspNonce: string | null;
} & {
    Page: unknown;
    _isHtmlOnly: boolean;
    _passToClient: import("../../server/runtime/renderPageServer/html/serializeContext.js").PassToClient;
} & {
    headersResponse: Headers;
} & {
    __getPageAssets: () => Promise<import("../../server/runtime/renderPageServer/getPageAssets.js").PageAsset[]>;
} & {
    _usesClientRouter: boolean;
}>;
