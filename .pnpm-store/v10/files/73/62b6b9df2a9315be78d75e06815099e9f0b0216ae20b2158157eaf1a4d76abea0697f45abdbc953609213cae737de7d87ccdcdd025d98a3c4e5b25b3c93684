export { generateVirtualFilePageEntry };
import { assert, getProjectError } from '../../../../utils/assert.js';
import { parseVirtualFileId, generateVirtualFileId } from '../../../../shared-server-node/virtualFileId.js';
import { getVikeConfigInternal } from '../../shared/resolveVikeConfigInternal.js';
import { extractAssetsAddQuery } from '../../../../shared-server-node/extractAssetsQuery.js';
import { debug } from './debug.js';
import { serializeConfigValues, } from '../../../../shared-server-client/page-configs/serialize/serializeConfigValues.js';
import { handleAssetsManifest_isFixEnabled } from '../build/handleAssetsManifest.js';
import { getConfigValueBuildTime } from '../../../../shared-server-client/page-configs/getConfigValueBuildTime.js';
import { resolveIncludeAssetsImportedByServer } from '../../../../server/runtime/renderPageServer/getPageAssets/retrievePageAssetsProd.js';
import '../../assertEnvVite.js';
async function generateVirtualFilePageEntry(id, isDev) {
    const result = parseVirtualFileId(id);
    assert(result && result.type === 'page-entry');
    /* This assertion fails when using includeAssetsImportedByServer
    {
      const isForClientSide = !config.build.ssr
      assert(result.isForClientSide === isForClientSide)
    }
    */
    const { pageId, isForClientSide } = result;
    const vikeConfig = await getVikeConfigInternal(true);
    const { _pageConfigs: pageConfigs } = vikeConfig;
    const pageConfig = pageConfigs.find((pageConfig) => pageConfig.pageId === pageId);
    if (!isDev) {
        assert(pageConfig);
    }
    else {
        /* This assertion sometimes fail. It happens very seldom and I couldn't reproduce it (https://gist.github.com/brillout/9e212ce829f4d62a912ca163ffa8881a). I suspect some kind of HMR race condition. UPDATE: [December 2024] This just happened at test/@cloudflare_vite-plugin/ — it isn't blocking, reloading the page fixes the issue.
        assert(pageConfig, { id, pageId })
        /*/
        if (!pageConfig)
            throw getProjectError('Outdated request');
        //*/
    }
    const code = getCode(pageConfig, isForClientSide, pageId, resolveIncludeAssetsImportedByServer(vikeConfig.config), isDev);
    debug(id, isForClientSide ? 'CLIENT-SIDE' : 'SERVER-SIDE', code);
    return code;
}
function getCode(pageConfig, isForClientSide, pageId, includeAssetsImportedByServer, isDev) {
    const lines = [];
    const importStatements = [];
    const filesEnv = new Map();
    const isClientRouting = getConfigValueBuildTime(pageConfig, 'clientRouting', 'boolean')?.value ?? false;
    lines.push('export const configValuesSerialized = {');
    lines.push(...serializeConfigValues(pageConfig, importStatements, filesEnv, { isForClientSide, isClientRouting, isDev }, '', false));
    lines.push('};');
    if (!handleAssetsManifest_isFixEnabled() && includeAssetsImportedByServer && isForClientSide && !isDev) {
        importStatements.push(`import '${extractAssetsAddQuery(generateVirtualFileId({ type: 'page-entry', pageId, isForClientSide: false }))}'`);
    }
    const code = [...importStatements, ...lines].join('\n');
    return code;
}
