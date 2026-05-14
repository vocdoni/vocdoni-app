export { loadPageRoutes };
export { loadPageRoutesSync };
export type { PageRoutes };
export type { RouteType };
import type { PageFile } from '../getPageFiles.js';
import type { PageConfigRuntime, PageConfigGlobalRuntime } from '../../types/PageConfig.js';
import { type HookInternal } from '../hooks/getHook.js';
type PageRoute = {
    pageId: string;
    comesFromV1PageConfig: boolean;
} & ({
    routeString: string;
    routeDefinedAtString: null;
    routeType: 'FILESYSTEM';
    routeFilesystemDefinedBy: string;
} | {
    routeString: string;
    routeDefinedAtString: string;
    routeType: 'STRING';
} | {
    routeFunction: (arg: unknown) => unknown;
    routeFunctionFilePath: string;
    routeDefinedAtString: string;
    routeType: 'FUNCTION';
});
type PageRoutes = PageRoute[];
type RouteType = 'STRING' | 'FUNCTION' | 'FILESYSTEM';
declare function loadPageRoutes(pageFilesAll: PageFile[], pageConfigs: PageConfigRuntime[], pageConfigGlobal: PageConfigGlobalRuntime, allPageIds: string[]): Promise<{
    pageRoutes: PageRoutes;
    onBeforeRouteHook: null | HookInternal;
}>;
declare function loadPageRoutesSync(pageFilesAll: PageFile[], pageConfigs: PageConfigRuntime[], pageConfigGlobal: PageConfigGlobalRuntime, allPageIds: string[]): {
    pageRoutes: PageRoutes;
    onBeforeRouteHook: null | HookInternal;
};
