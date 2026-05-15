export { createGlobalContextShared };
export { getGlobalContextSyncErrMsg };
export type { GlobalContextBase };
export type { GlobalContextBasePublic };
export type GlobalContextInternal = GlobalContextServerInternal | GlobalContextClientInternal;
import type { PageFile } from './getPageFiles.js';
import type { PageConfigRuntime } from '../types/PageConfig.js';
import { type GlobalContextPublicMinimum } from './getGlobalContextPublicShared.js';
import type { GlobalContextServerInternal } from '../server/runtime/globalContext.js';
import type { GlobalContextClientInternal } from '../client/runtime-client-routing/getGlobalContextClientInternal.js';
import { type HookInternal } from './hooks/getHook.js';
declare const getGlobalContextSyncErrMsg = "The global context isn't set yet, call getGlobalContextSync() later or use getGlobalContext() instead.";
declare function createGlobalContextShared<GlobalContextAdded extends {}, GlobalContextAddedAsync extends {}>(virtualFileExportsGlobalEntry: unknown, globalObject: {
    globalContext?: {};
    onCreateGlobalContextHooks?: HookInternal<GlobalContextPublicMinimum>[];
    previousCreateGlobalContextPromise?: Promise<void>;
}, addGlobalContext?: (globalContext: GlobalContextBase) => GlobalContextAdded, addGlobalContextTmp?: (globalContext: GlobalContextBase) => Promise<GlobalContextAdded>, addGlobalContextAsync?: (globalContext: GlobalContextBase) => Promise<GlobalContextAddedAsync>): Promise<{
    _globalConfigPublic: {
        pages: {
            [k: string]: import("./page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../types/index.js").ConfigResolved;
        _source: import("./page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("./page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("./page-configs/resolveVikeConfigPublic.js").From;
    };
    pages: {
        [k: string]: import("./page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
    };
    config: import("../types/index.js").ConfigResolved;
    _source: import("./page-configs/resolveVikeConfigPublic.js").Source;
    _sources: import("./page-configs/resolveVikeConfigPublic.js").Sources;
    _from: import("./page-configs/resolveVikeConfigPublic.js").From;
    /**
     * Useful for distinguishing `globalContext` from other objects and narrowing down TypeScript unions.
     *
     * https://vike.dev/globalContext#typescript
     */
    isGlobalContext: true;
    _isOriginalObject: true;
    _virtualFileExportsGlobalEntry: unknown;
    _pageFilesAll: PageFile[];
    _pageConfigs: PageConfigRuntime[];
    _pageConfigGlobal: import("../types/PageConfig.js").PageConfigGlobalRuntime;
    _allPageIds: string[];
} & GlobalContextAdded & Awaited<GlobalContextAddedAsync>>;
type GlobalContextBasePublic = Pick<GlobalContextBase, 'config' | 'pages' | 'isGlobalContext'>;
type GlobalContextBase = ReturnType<typeof createGlobalContextBase>;
declare function createGlobalContextBase(virtualFileExportsGlobalEntry: unknown): {
    _globalConfigPublic: {
        pages: {
            [k: string]: import("./page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
        };
        config: import("../types/index.js").ConfigResolved;
        _source: import("./page-configs/resolveVikeConfigPublic.js").Source;
        _sources: import("./page-configs/resolveVikeConfigPublic.js").Sources;
        _from: import("./page-configs/resolveVikeConfigPublic.js").From;
    };
    pages: {
        [k: string]: import("./page-configs/resolveVikeConfigPublic.js").PageConfigPublicWithRoute;
    };
    config: import("../types/index.js").ConfigResolved;
    _source: import("./page-configs/resolveVikeConfigPublic.js").Source;
    _sources: import("./page-configs/resolveVikeConfigPublic.js").Sources;
    _from: import("./page-configs/resolveVikeConfigPublic.js").From;
    /**
     * Useful for distinguishing `globalContext` from other objects and narrowing down TypeScript unions.
     *
     * https://vike.dev/globalContext#typescript
     */
    isGlobalContext: true;
    _isOriginalObject: true;
    _virtualFileExportsGlobalEntry: unknown;
    _pageFilesAll: PageFile[];
    _pageConfigs: PageConfigRuntime[];
    _pageConfigGlobal: import("../types/PageConfig.js").PageConfigGlobalRuntime;
    _allPageIds: string[];
};
