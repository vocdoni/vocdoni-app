export { createPageContextClient };
export type PageContextCreatedClient = Awaited<ReturnType<typeof createPageContextClient>>;
import '../assertEnvClient.js';
declare function createPageContextClient(urlOriginal: string): Promise<{
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
} & import("../../shared-server-client/page-configs/resolveVikeConfigPublic.js").GlobalConfigPublic>;
