export { loadAndParseVirtualFilePageEntry };
import { objectAssign } from '../../utils/objectAssign.js';
import { parseConfigValuesSerialized } from './serialize/parsePageConfigsSerialized.js';
import { assertVirtualFileExports } from '../assertVirtualFileExports.js';
async function loadAndParseVirtualFilePageEntry(pageConfig, isDev) {
    if ('isPageEntryLoaded' in pageConfig &&
        // We don't need to cache in dev, since Vite already caches the virtual module
        !isDev) {
        return pageConfig;
    }
    const { moduleId, moduleExportsPromise } = pageConfig.loadVirtualFilePageEntry();
    const moduleExports = await moduleExportsPromise;
    /* `moduleExports` is sometimes `undefined` https://github.com/vikejs/vike/discussions/2092
    assert(moduleExports)
    //*/
    // Catch @cloudflare/vite-plugin bug
    assertVirtualFileExports(moduleExports, () => 'configValuesSerialized' in moduleExports, moduleId);
    const virtualFileExportsPageEntry = moduleExports;
    let configValues;
    try {
        configValues = parseVirtualFileExportsPageEntry(virtualFileExportsPageEntry);
    }
    catch (e) {
        // Safari WebKit bug: dynamic import() may resolve before the module body executes.
        if (
        // Throwing ReferenceError (TDZ): https://github.com/vikejs/vike/issues/3121
        !(e instanceof ReferenceError) &&
            // Or TypeError (undefined exports) on some WebKit builds: https://github.com/vikejs/vike/issues/3199
            !(e instanceof TypeError))
            throw e;
        await new Promise((resolve) => setTimeout(resolve));
        configValues = parseVirtualFileExportsPageEntry(virtualFileExportsPageEntry);
    }
    Object.assign(pageConfig.configValues, configValues);
    objectAssign(pageConfig, { isPageEntryLoaded: true });
    return pageConfig;
}
function parseVirtualFileExportsPageEntry(virtualFileExportsPageEntry) {
    const configValues = parseConfigValuesSerialized(virtualFileExportsPageEntry.configValuesSerialized);
    return configValues;
}
