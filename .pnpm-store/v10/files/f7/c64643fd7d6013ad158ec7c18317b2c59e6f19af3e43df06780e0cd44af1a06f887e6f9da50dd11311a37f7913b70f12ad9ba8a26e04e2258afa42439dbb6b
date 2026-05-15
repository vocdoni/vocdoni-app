export { analyzeClientSide };
import { getConfigValueRuntime } from '../page-configs/getConfigValueRuntime.js';
import { analyzePageClientSide } from './analyzePageClientSide.js';
function analyzeClientSide(pageConfig, pageFilesAll, pageId) {
    // V1 design
    if (pageConfig) {
        const isClientRouting = getConfigValueRuntime(pageConfig, 'clientRouting', 'boolean')?.value ?? false;
        const isClientRuntimeLoaded = getConfigValueRuntime(pageConfig, 'isClientRuntimeLoaded', 'boolean')?.value ?? false;
        return { isClientRuntimeLoaded, isClientRouting };
    }
    else {
        // TO-DO/next-major-release: remove
        // V0.4 design
        const { isHtmlOnly, isClientRouting } = analyzePageClientSide(pageFilesAll, pageId);
        return { isClientRuntimeLoaded: !isHtmlOnly, isClientRouting };
    }
}
