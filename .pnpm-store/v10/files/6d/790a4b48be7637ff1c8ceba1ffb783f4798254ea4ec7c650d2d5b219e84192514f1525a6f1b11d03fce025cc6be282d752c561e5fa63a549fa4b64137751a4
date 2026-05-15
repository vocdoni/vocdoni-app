export { setGlobalContext_prodBuildEntry } from '../runtime/globalContext.js';
export { route, getPagesAndRoutes };
export type { PageRoutes, PageFile, PageConfigRuntime as PageConfig };
import { route as routeInternal, type PageRoutes } from '../../shared-server-client/route/index.js';
import type { PageFile } from '../../shared-server-client/getPageFiles/getPageFileObject.js';
import { PageConfigRuntime } from '../../types/PageConfig.js';
import '../assertEnvServer.js';
/**
 * Used by {@link https://github.com/magne4000/vite-plugin-vercel|vite-plugin-vercel} to compute some rewrite rules and extract { isr } configs.
 *
 * TO-DO/eventually: remove
 */
declare function getPagesAndRoutes(): Promise<{
    pageRoutes: PageRoutes;
    pageFilesAll: PageFile[];
    pageConfigs: PageConfigRuntime[];
    allPageIds: string[];
}>;
declare function route(pageContext: Parameters<typeof routeInternal>[0]): Promise<{
    pageContextAddendum: import("../../shared-server-client/route/index.js").PageContextAfterRoute;
}>;
