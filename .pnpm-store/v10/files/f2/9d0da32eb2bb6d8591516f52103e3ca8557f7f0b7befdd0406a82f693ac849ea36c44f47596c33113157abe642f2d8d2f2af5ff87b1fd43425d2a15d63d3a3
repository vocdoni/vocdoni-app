export { getGlobalContextClientInternal };
import { getGlobalContextClientInternalShared } from '../shared/getGlobalContextClientInternalShared.js';
import { loadPageRoutes } from '../../shared-server-client/route/loadPageRoutes.js';
import { objectAssign } from '../../utils/objectAssign.js';
import '../assertEnvClient.js';
async function getGlobalContextClientInternal() {
    const globalContext = await getGlobalContextClientInternalShared();
    objectAssign(globalContext, await addGlobalContext(globalContext));
    return globalContext;
}
// TO-DO/next-major-release make this function sync
async function addGlobalContext(globalContext) {
    const { pageRoutes, onBeforeRouteHook } = await loadPageRoutes(globalContext._pageFilesAll, globalContext._pageConfigs, globalContext._pageConfigGlobal, globalContext._allPageIds);
    return {
        _pageRoutes: pageRoutes,
        _onBeforeRouteHook: onBeforeRouteHook,
    };
}
