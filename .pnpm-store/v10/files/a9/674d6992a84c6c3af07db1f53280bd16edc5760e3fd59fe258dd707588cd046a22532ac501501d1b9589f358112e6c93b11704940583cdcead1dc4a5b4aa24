export { createPageContextClient };
import { createPageContextObject, createPageContextShared } from '../../shared-server-client/createPageContextShared.js';
import { getPageContextUrlComputed } from '../../shared-server-client/getPageContextUrlComputed.js';
import { getBaseServer } from './getBaseServer.js';
import { getGlobalContextClientInternal } from './getGlobalContextClientInternal.js';
import { assert } from '../../utils/assert.js';
import { objectAssign } from '../../utils/objectAssign.js';
import { isBaseServer } from '../../utils/parseUrl.js';
import { updateType } from '../../utils/updateType.js';
import '../assertEnvClient.js';
async function createPageContextClient(urlOriginal) {
    const pageContext = createPageContextBase(urlOriginal);
    const globalContext = await getGlobalContextClientInternal();
    objectAssign(pageContext, {
        _globalContext: globalContext,
        _pageFilesAll: globalContext._pageFilesAll, // TO-DO/next-major-release: remove
    });
    const pageContextAugmented = createPageContextShared(pageContext, globalContext._globalConfigPublic);
    updateType(pageContext, pageContextAugmented);
    return pageContext;
}
function createPageContextBase(urlOriginal) {
    const pageContext = createPageContextObject();
    objectAssign(pageContext, {
        isClientSide: true,
        isPrerendering: false,
        urlOriginal,
        _urlHandler: null,
    });
    const baseServer = getBaseServer();
    assert(isBaseServer(baseServer));
    objectAssign(pageContext, {
        _baseServer: baseServer,
    });
    const pageContextUrlComputed = getPageContextUrlComputed(pageContext);
    objectAssign(pageContext, pageContextUrlComputed);
    return pageContext;
}
