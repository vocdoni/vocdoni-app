export { getGlobalContext };
export { getGlobalContextSync };
export { getGlobalContextAsync };
export { getGlobalContextServerInternal };
export { getGlobalContextServerInternalOptional };
export { getViteDevServer };
export { getViteConfig };
export { initGlobalContext_renderPage };
export { initGlobalContext_runPrerender };
export { initGlobalContext_getPagesAndRoutes };
export { setGlobalContext_viteDevServer };
export { setGlobalContext_viteConfig };
export { setGlobalContext_isPrerendering };
export { setGlobalContext_prerenderContext };
export { setGlobalContext_isProductionAccordingToVite };
export { setGlobalContext_prodBuildEntry };
export { clearGlobalContext };
export { assertBuildInfo };
export { updateUserFiles };
export { vikeConfigErrorRecoverMsg };
export type { BuildInfo };
export type { GlobalContextServerInternal };
import type { ViteManifest } from '../../types/ViteManifest.js';
import type { ResolvedConfig, ViteDevServer } from 'vite';
import { type PageRoutes } from '../../shared-server-client/route/loadPageRoutes.js';
import type { ViteConfigRuntime } from '../../node/vite/shared/getViteConfigRuntime.js';
import type { GlobalContext } from '../../types/GlobalContext.js';
import type { HookInternal } from '../../shared-server-client/hooks/getHook.js';
import type { PrerenderContext } from '../../types/index.js';
import '../assertEnvServer.js';
declare const vikeConfigErrorRecoverMsg: "Vike config loaded";
type GlobalContextServerInternal = Awaited<ReturnType<typeof createGlobalContext>>;
declare function getGlobalContextServerInternal(): Promise<{
    globalContext: (Record<string, unknown> & {
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
    } & {
        _isProduction: false;
        _isPrerendering: false;
        assetsManifest: null;
        _viteDevServer: ViteDevServer | undefined;
        viteConfig: ResolvedConfig | undefined;
        isClientSide: false;
        _pageRoutes: PageRoutes;
        _onBeforeRouteHook: HookInternal | null;
    } & {
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
    } & {
        prerenderContext: PrerenderContext | undefined;
    }) | (Record<string, unknown> & {
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
    } & {
        _isPrerendering: true;
        viteConfig: ResolvedConfig;
        _isProduction: true;
        assetsManifest: ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: PageRoutes;
        _onBeforeRouteHook: HookInternal | null;
    } & {
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
    } & {
        prerenderContext: PrerenderContext | undefined;
    }) | (Record<string, unknown> & {
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
    } & {
        _isPrerendering: false;
        viteConfig: null;
        _isProduction: true;
        assetsManifest: ViteManifest;
        _viteDevServer: null;
        _usesClientRouter: boolean;
        isClientSide: false;
        _pageRoutes: PageRoutes;
        _onBeforeRouteHook: HookInternal | null;
    } & {
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
    } & {
        prerenderContext: PrerenderContext | undefined;
    });
}>;
declare function getGlobalContextServerInternalOptional(): (Record<string, unknown> & (({
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
    _viteDevServer: ViteDevServer | undefined;
    viteConfig: ResolvedConfig | undefined;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
} | {
    _isPrerendering: true;
    viteConfig: ResolvedConfig;
    _isProduction: true;
    assetsManifest: ViteManifest;
    _viteDevServer: null;
    _usesClientRouter: boolean;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
} | {
    _isPrerendering: false;
    viteConfig: null;
    _isProduction: true;
    assetsManifest: ViteManifest;
    _viteDevServer: null;
    _usesClientRouter: boolean;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
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
    prerenderContext: PrerenderContext | undefined;
})) | null;
/**
 * Get runtime information about your app.
 *
 * https://vike.dev/getGlobalContext
 */
declare function getGlobalContext(): Promise<GlobalContext>;
/**
 * Get runtime information about your app.
 *
 * https://vike.dev/getGlobalContext
 */
declare function getGlobalContextAsync(isProduction: boolean): Promise<GlobalContext>;
/**
 * Get runtime information about your app.
 *
 * https://vike.dev/getGlobalContext
 */
declare function getGlobalContextSync(): GlobalContext;
declare function setGlobalContext_viteDevServer(viteDevServer: ViteDevServer): Promise<void>;
declare function setGlobalContext_viteConfig(viteConfig: ResolvedConfig, viteConfigRuntime: ViteConfigRuntime): void;
declare function setGlobalContext_isPrerendering(): void;
declare function setGlobalContext_prerenderContext(prerenderContextPublic: PrerenderContext): void;
declare function setGlobalContext_isProductionAccordingToVite(isProductionAccordingToVite: boolean): void;
declare function getViteDevServer(): ViteDevServer | null;
declare function getViteConfig(): ResolvedConfig | null;
declare function initGlobalContext_renderPage(): Promise<void>;
declare function initGlobalContext_runPrerender(): Promise<void>;
declare function initGlobalContext_getPagesAndRoutes(): Promise<void>;
declare function setGlobalContext_prodBuildEntry(prodBuildEntry: unknown): Promise<void>;
type BuildInfo = {
    versionAtBuildTime: string;
    usesClientRouter: boolean;
    viteConfigRuntime: ViteConfigRuntime;
};
declare function assertBuildInfo(buildInfo: unknown): asserts buildInfo is BuildInfo;
declare function updateUserFiles(): Promise<{
    success: boolean;
}>;
declare function createGlobalContext(virtualFileExportsGlobalEntry: unknown): Promise<({
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
    _viteDevServer: ViteDevServer | undefined;
    viteConfig: ResolvedConfig | undefined;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
} | {
    _isPrerendering: true;
    viteConfig: ResolvedConfig;
    _isProduction: true;
    assetsManifest: ViteManifest;
    _viteDevServer: null;
    _usesClientRouter: boolean;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
} | {
    _isPrerendering: false;
    viteConfig: null;
    _isProduction: true;
    assetsManifest: ViteManifest;
    _viteDevServer: null;
    _usesClientRouter: boolean;
    isClientSide: false;
    _pageRoutes: PageRoutes;
    _onBeforeRouteHook: HookInternal | null;
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
    prerenderContext: PrerenderContext | undefined;
}>;
declare function clearGlobalContext(): void;
