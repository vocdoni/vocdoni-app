export { loadPageConfigsLazyServerSide };
import { getPageFilesServerSide } from '../../../shared-server-client/getPageFiles.js';
import { resolvePageContextConfig } from '../../../shared-server-client/page-configs/resolveVikeConfigPublic.js';
import { analyzePageClientSideInit } from '../../../shared-server-client/getPageFiles/analyzePageClientSide.js';
import { isArray } from '../../../utils/isArray.js';
import { assertUsage, assertWarning } from '../../../utils/assert.js';
import { hasProp } from '../../../utils/hasProp.js';
import { isObject } from '../../../utils/isObject.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { updateType } from '../../../utils/updateType.js';
import { getPageAssets } from './getPageAssets.js';
import { findPageConfig } from '../../../shared-server-client/page-configs/findPageConfig.js';
import { analyzePage } from './analyzePage.js';
import { loadAndParseVirtualFilePageEntry } from '../../../shared-server-client/page-configs/loadAndParseVirtualFilePageEntry.js';
import { execHookServer } from './execHookServer.js';
import { resolveHeadersResponseEarly } from './headersResponse.js';
import { resolvePageContextCspNone } from './csp.js';
import '../../assertEnvServer.js';
async function loadPageConfigsLazyServerSide(pageContext) {
    objectAssign(pageContext, {
        _pageConfig: findPageConfig(pageContext._globalContext._pageConfigs, pageContext.pageId),
    });
    // Load the page's + files
    objectAssign(pageContext, await loadPageUserFiles(pageContext));
    // Resolve new computed pageContext properties
    updateType(pageContext, await resolvePageContext(pageContext));
    // Execute +onCreatePageContext
    await execHookServer('onCreatePageContext', pageContext);
    return pageContext;
}
async function resolvePageContext(pageContext) {
    const { isHtmlOnly, clientEntries, clientDependencies } = analyzePage(pageContext);
    const passToClient = [];
    const errMsgSuffix = ' should be an array of strings.';
    const isV1Design = !!pageContext._pageConfig;
    if (!isV1Design) {
        pageContext.exportsAll.passToClient?.forEach((e) => {
            assertUsage(hasProp(e, 'exportValue', 'string[]'), `${e.exportSource}${errMsgSuffix}`);
            passToClient.push(...e.exportValue);
        });
    }
    else {
        pageContext.from.configsCumulative.passToClient?.values.forEach((v) => {
            const { value, definedAt } = v;
            const errMsg = `+passToClient value defined at ${definedAt}${errMsgSuffix}`;
            //*/ TO-DO/next-major-release: remove the passToClient once setting from the public API
            assertUsage(isArray(value), `+passToClient value defined at ${definedAt} should be an array`);
            const valS = value.map((el) => {
                if (isObject(el)) {
                    assertWarning(!('once' in el), 'The passToClient once setting is deprecated and no longer has any effect. Instead, see the upcoming .once.js suffix (see https://github.com/vikejs/vike/issues/2566 for more information).', { onlyOnce: true });
                    assertUsage(hasProp(el, 'prop', 'string'), errMsg);
                    return el.prop;
                }
                assertUsage(typeof el === 'string', errMsg);
                return el;
            });
            /*/
            assertUsage(isArrayOfStrings(value), errMsg)
            //*/
            passToClient.push(...valS);
        });
    }
    objectAssign(pageContext, await resolvePageContextCspNone(pageContext));
    objectAssign(pageContext, {
        Page: pageContext.exports.Page,
        _isHtmlOnly: isHtmlOnly,
        _passToClient: passToClient,
    });
    objectAssign(pageContext, await resolveHeadersResponseEarly(pageContext));
    objectAssign(pageContext, {
        __getPageAssets: async () => {
            if ('_pageAssets' in pageContext) {
                return pageContext._pageAssets;
            }
            else {
                const pageAssets = await getPageAssets(pageContext, clientDependencies, clientEntries);
                objectAssign(pageContext, { _pageAssets: pageAssets });
                return pageContext._pageAssets;
            }
        },
    });
    // TO-DO/next-major-release: remove
    Object.assign(pageContext, {
        _getPageAssets: async () => {
            assertWarning(false, 'pageContext._getPageAssets() deprecated, see https://vike.dev/preloading', {
                onlyOnce: true,
                showStackTrace: true,
            });
            const pageAssetsOldFormat = [];
            (await pageContext.__getPageAssets()).forEach((p) => {
                if (p.assetType === 'script' && p.isEntry) {
                    pageAssetsOldFormat.push({
                        src: p.src,
                        preloadType: null,
                        assetType: 'script',
                        mediaType: p.mediaType,
                    });
                }
                pageAssetsOldFormat.push({
                    src: p.src,
                    preloadType: p.assetType,
                    assetType: p.assetType === 'style' ? 'style' : 'preload',
                    mediaType: p.mediaType,
                });
            });
            return pageAssetsOldFormat;
        },
    });
    return pageContext;
}
async function loadPageUserFiles(pageContext) {
    const [{ pageContextAddendum }] = await Promise.all([
        (async () => {
            const pageFilesServerSide = getPageFilesServerSide(pageContext._pageFilesAll, pageContext.pageId);
            const isDev = !pageContext._globalContext._isProduction;
            const pageConfigLoaded = !pageContext._pageConfig
                ? null
                : await loadAndParseVirtualFilePageEntry(pageContext._pageConfig, isDev);
            await Promise.all(pageFilesServerSide.map((p) => p.loadFile?.()));
            const pageContextAddendum = resolvePageContextConfig(pageFilesServerSide, pageConfigLoaded, pageContext._globalContext._pageConfigGlobal);
            return { pageContextAddendum };
        })(),
        analyzePageClientSideInit(pageContext._globalContext._pageFilesAll, pageContext.pageId, {
            sharedPageFilesAlreadyLoaded: true,
        }),
    ]);
    return pageContextAddendum;
}
