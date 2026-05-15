export { log404 };
export { getRoutesInfo };
import type { PageRoutes } from '../../../../shared-server-client/route/index.js';
import type { GlobalContextServerInternal } from '../../globalContext.js';
import type { PageContextCreatedServer } from '../createPageContextServer.js';
import '../../../assertEnvServer.js';
declare function log404(pageContext: PageContextCreatedServer & {
    urlPathname: string;
    errorWhileRendering: null | Error;
    _globalContext: GlobalContextServerInternal;
}): void;
declare function getRoutesInfo(pageRoutes: PageRoutes): string | null;
