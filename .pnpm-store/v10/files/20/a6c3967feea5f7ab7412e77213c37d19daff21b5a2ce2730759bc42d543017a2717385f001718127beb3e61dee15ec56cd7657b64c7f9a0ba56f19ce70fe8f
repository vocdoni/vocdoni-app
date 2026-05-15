export { getPageAssets };
import { retrievePageAssetsProd } from './getPageAssets/retrievePageAssetsProd.js';
import { retrievePageAssetsDev } from './getPageAssets/retrievePageAssetsDev.js';
import { inferMediaType } from './inferMediaType.js';
import { sortPageAssetsForEarlyHintsHeader } from './getPageAssets/sortPageAssetsForEarlyHintsHeader.js';
import { toPosixPath } from '../../../utils/path.js';
import { unique } from '../../../utils/unique.js';
import { getViteRPC } from '../../../utils/getViteRPC.js';
import { assert } from '../../../utils/assert.js';
import { prependBase } from '../../../utils/parseUrl-extras.js';
import '../../assertEnvServer.js';
async function getPageAssets(pageContext, clientDependencies, clientEntries) {
    const globalContext = pageContext._globalContext;
    const { _isProduction: isProduction } = globalContext;
    const isDev = !isProduction;
    const { assetUrls, clientEntriesSrc } = isDev
        ? !globalContext._viteDevServer
            ? await getViteRPC().retrievePageAssetsDevRPC(clientDependencies, clientEntries)
            : await retrievePageAssetsDev(globalContext._viteDevServer, clientDependencies, clientEntries)
        : retrievePageAssetsProd(globalContext.assetsManifest, clientDependencies, clientEntries, globalContext.config);
    let pageAssets = [];
    unique([...clientEntriesSrc, ...assetUrls]).forEach((src) => {
        const { mediaType = null, assetType = null } = inferMediaType(src) || {};
        if (isDev && assetType === 'style') {
            // https://github.com/vikejs/vike/issues/449
            if (src.endsWith('?inline')) {
                return;
            }
            // https://github.com/vikejs/vike/issues/401
            // WARNING: if changing following line, then also update https://github.com/vikejs/vike/blob/fae90a15d88e5e87ca9fcbb54cf2dc8773d2f229/vike/client/shared/removeFoucBuster.ts#L28
            src = src + '?direct';
        }
        const isEntry = clientEntriesSrc.includes(src) ||
            // Vite automatically injects CSS, not only in development, but also in production (albeit with a FOUC). Therefore, strictly speaking, CSS aren't entries. We still, however, set `isEntry: true` for CSS, in order to denote page assets that should absolutely be injected in the HTML, regardless of preload strategy (not injecting CSS leads to FOUC).
            assetType === 'style';
        pageAssets.push({
            src,
            assetType,
            mediaType,
            isEntry,
        });
    });
    pageAssets.forEach(({ src }) => {
        assert(1 === pageAssets.filter((p) => p.src === src).length);
    });
    pageAssets = pageAssets.map((pageAsset) => {
        const baseServerAssets = pageContext._baseAssets || pageContext._baseServer;
        pageAsset.src = prependBase(toPosixPath(pageAsset.src), baseServerAssets);
        return pageAsset;
    });
    await sortPageAssetsForEarlyHintsHeader(pageAssets, isProduction);
    return pageAssets;
}
