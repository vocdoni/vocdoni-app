// TO-DO/pageContext-prefetch: rename this file to getPrefetchSettingResolved.ts
export { getPrefetchSettings };
export { PAGE_CONTEXT_MAX_AGE_DEFAULT };
import { assertUsage, assertInfo } from '../../../utils/assert.js';
import '../../assertEnvClient.js';
// TO-DO/pageContext-prefetch: Make it `Infinity` for pre-rendered pages.
const PAGE_CONTEXT_MAX_AGE_DEFAULT = 5000;
const prefetchSettingTrue = {
    staticAssets: 'hover',
    pageContext: PAGE_CONTEXT_MAX_AGE_DEFAULT,
};
const prefetchSettingFalse = {
    staticAssets: 'hover',
    pageContext: false,
};
// TO-DO/eventually: change to `prefetchSettingTrue`
const prefetchSettingDefault = prefetchSettingFalse;
function getPrefetchSettings(pageContext, linkTag) {
    let prefetchSetting = prefetchSettingDefault;
    // TO-DO/next-major-release: remove
    if ('prefetchLinks' in pageContext.exports) {
        assertUsage(false, '`export { prefetchLinks }` is deprecated, use `export { prefetchStaticAssets }` instead.');
    }
    // TO-DO/next-major-release: remove
    if ('prefetchStaticAssets' in pageContext.exports) {
        const prefetchStaticAssets = pageContext.exports.prefetchStaticAssets;
        /* TO-DO/pageContext-prefetch: uncomment
        const msg = `The 'prefetchStaticAssets' setting is deprecated in favor of the 'prefetch' setting, see https://vike.dev/prefetch`
        assertWarning(false, msg, { onlyOnce: true })
        assertUsage(
          prefetchStaticAssets === false || prefetchStaticAssets === 'hover' || prefetchStaticAssets === 'viewport',
          msg
        )
        //*/
        prefetchSetting.staticAssets = prefetchStaticAssets;
    }
    if ('prefetch' in pageContext.exports) {
        const { prefetch } = pageContext.exports;
        if (prefetch === true)
            prefetchSetting = prefetchSettingTrue;
        if (prefetch === false)
            prefetchSetting = prefetchSettingFalse;
        // No validation in order to save client-side KBs
        Object.assign(prefetchSetting, prefetch);
        if (prefetchSetting.pageContext === true) {
            prefetchSetting.pageContext = PAGE_CONTEXT_MAX_AGE_DEFAULT;
        }
    }
    if (prefetchSetting.staticAssets === 'viewport' && import.meta.env.DEV) {
        assertInfo(false, 'Viewport prefetching is disabled in development', { onlyOnce: true });
        prefetchSetting.staticAssets = 'hover';
    }
    if (linkTag) {
        {
            let attr = linkTag.getAttribute('data-prefetch');
            if (attr !== null) {
                if (attr === '')
                    attr = 'true';
                if (attr === 'true')
                    prefetchSetting = prefetchSettingTrue;
                if (attr === 'false')
                    prefetchSetting = prefetchSettingFalse;
            }
        }
        {
            let attr = linkTag.getAttribute('data-prefetch-static-assets');
            if (attr !== null) {
                if (attr === 'false')
                    prefetchSetting.staticAssets = false;
                // No validation in order to save client-side KBs
                prefetchSetting.staticAssets = attr;
            }
        }
        {
            let attr = linkTag.getAttribute('data-prefetch-page-context');
            if (attr !== null) {
                if (attr === '')
                    attr = 'true';
                if (attr === 'true')
                    prefetchSetting.pageContext = PAGE_CONTEXT_MAX_AGE_DEFAULT;
                if (attr === 'false')
                    prefetchSetting.pageContext = false;
                const n = parseInt(attr, 10);
                if (!Number.isNaN(n))
                    prefetchSetting.pageContext = n;
                // No validation in order to save client-side KBs
            }
        }
    }
    return prefetchSetting;
}
