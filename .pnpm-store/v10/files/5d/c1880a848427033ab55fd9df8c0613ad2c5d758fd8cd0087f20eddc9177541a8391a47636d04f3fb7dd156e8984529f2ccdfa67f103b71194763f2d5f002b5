export { loadPageConfigsLazyClientSide };
export type { PageContext_loadPageConfigsLazyClientSide };
export { isErrorFetchingStaticAssets };
import { type PageFile } from '../../shared-server-client/getPageFiles.js';
import type { PageConfigGlobalRuntime, PageConfigRuntime } from '../../types/PageConfig.js';
import '../assertEnvClient.js';
type PageContext_loadPageConfigsLazyClientSide = {
    pageId: string;
    _pageFilesAll: PageFile[];
    _globalContext: {
        _pageConfigs: PageConfigRuntime[];
        _pageConfigGlobal: PageConfigGlobalRuntime;
    };
};
declare function loadPageConfigsLazyClientSide(pageId: string, pageFilesAll: PageFile[], pageConfigs: PageConfigRuntime[], pageConfigGlobal: PageConfigGlobalRuntime): Promise<import("../../shared-server-client/getPageFiles.js").PageContextConfig & {
    _pageFilesLoaded: PageFile[];
}>;
declare function isErrorFetchingStaticAssets(err: unknown): boolean;
