export { getGlobalContext };
export { getGlobalContextSync };
export { setVirtualFileExportsGlobalEntry };
export { getGlobalContextClientInternalShared };
export type GlobalContextClientInternalShared = GlobalContextClientInternal | GlobalContextClientInternalWithServerRouting;
import type { GlobalContextClientInternal } from '../runtime-client-routing/getGlobalContextClientInternal.js';
import type { GlobalContextClientInternalWithServerRouting } from '../runtime-server-routing/getGlobalContextClientInternal.js';
import '../assertEnvClient.js';
declare function getGlobalContextClientInternalShared(): Promise<{
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
    /**
     * Whether the environment is the client-side:
     * - In the browser, the value is `true`.
     * - Upon SSR and pre-rendering, the value is `false`.
     *
     * https://vike.dev/globalContext#isClientSide
     */
    isClientSide: true;
}>;
type TypeIsNotExported = never;
declare function getGlobalContext(): Promise<TypeIsNotExported>;
declare function getGlobalContextSync(): TypeIsNotExported;
declare function setVirtualFileExportsGlobalEntry(virtualFileExportsGlobalEntry: unknown): Promise<void>;
