export { createPageContextClient };
import { objectAssign } from '../../utils/objectAssign.js';
import { updateType } from '../../utils/updateType.js';
import { createPageContextObject, createPageContextShared } from '../../shared-server-client/createPageContextShared.js';
import { getGlobalContextClientInternal } from './getGlobalContextClientInternal.js';
import '../assertEnvClient.js';
async function createPageContextClient() {
    const pageContext = createPageContextBase();
    const globalContext = await getGlobalContextClientInternal();
    objectAssign(pageContext, {
        _globalContext: globalContext,
        _pageFilesAll: globalContext._pageFilesAll, // TO-DO/next-major-release: remove
    });
    // Sets pageContext.config to global configs
    updateType(pageContext, createPageContextShared(pageContext, globalContext._globalConfigPublic));
    return pageContext;
}
function createPageContextBase() {
    const pageContextCreated = createPageContextObject();
    objectAssign(pageContextCreated, {
        isClientSide: true,
        isPrerendering: false,
        isHydration: true,
        isBackwardNavigation: null,
        isHistoryNavigation: null,
        _hasPageContextFromServer: true,
    });
    return pageContextCreated;
}
