export { isClientSideRoutable };
import { analyzePageClientSideInit } from '../../shared-server-client/getPageFiles/analyzePageClientSide.js';
import { findPageConfig } from '../../shared-server-client/page-configs/findPageConfig.js';
import { analyzeClientSide } from '../../shared-server-client/getPageFiles/analyzeClientSide.js';
import '../assertEnvClient.js';
// TO-DO/next-major-release: make it sync
async function isClientSideRoutable(pageId, pageContext) {
    await analyzePageClientSideInit(pageContext._pageFilesAll, pageId, {
        sharedPageFilesAlreadyLoaded: false,
    });
    const pageConfig = findPageConfig(pageContext._globalContext._pageConfigs, pageId);
    const { isClientRuntimeLoaded, isClientRouting } = analyzeClientSide(pageConfig, pageContext._pageFilesAll, pageId);
    return isClientRuntimeLoaded && isClientRouting;
}
