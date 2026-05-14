export { parseVirtualFileExportsGlobalEntry };
// TO-DO/next-major-release: remove old design code, and remove all assertions.
import { assert } from '../../utils/assert.js';
import { cast } from '../../utils/cast.js';
import { hasProp } from '../../utils/hasProp.js';
import { isArray } from '../../utils/isArray.js';
import { isCallable } from '../../utils/isCallable.js';
import { isObject } from '../../utils/isObject.js';
import { assertExportValues } from './assert_exports_old_design.js';
import { getPageFileObject } from './getPageFileObject.js';
import { fileTypes } from './fileTypes.js';
import { parsePageConfigsSerialized } from '../page-configs/serialize/parsePageConfigsSerialized.js';
import { assertVirtualFileExports } from '../assertVirtualFileExports.js';
function parseVirtualFileExportsGlobalEntry(virtualFileExportsGlobalEntry) {
    assertVirtualFileExports(virtualFileExportsGlobalEntry, (moduleExports) => 'pageFilesLazy' in moduleExports);
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageFilesLazy', 'object'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageFilesEager', 'object'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageFilesExportNamesLazy', 'object'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageFilesExportNamesEager', 'object'));
    assert(hasProp(virtualFileExportsGlobalEntry.pageFilesLazy, '.page'));
    assert(hasProp(virtualFileExportsGlobalEntry.pageFilesLazy, '.page.client') ||
        hasProp(virtualFileExportsGlobalEntry.pageFilesLazy, '.page.server'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageFilesList', 'string[]'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageConfigsSerialized'));
    assert(hasProp(virtualFileExportsGlobalEntry, 'pageConfigGlobalSerialized'));
    const { pageConfigsSerialized, pageConfigGlobalSerialized } = virtualFileExportsGlobalEntry;
    assertPageConfigsSerialized(pageConfigsSerialized);
    assertPageConfigGlobalSerialized(pageConfigGlobalSerialized);
    const { pageConfigs, pageConfigGlobal } = parsePageConfigsSerialized(pageConfigsSerialized, pageConfigGlobalSerialized);
    const pageFilesMap = {};
    parseGlobResult(virtualFileExportsGlobalEntry.pageFilesLazy).forEach(({ filePath, pageFile, globValue }) => {
        pageFile = pageFilesMap[filePath] = pageFilesMap[filePath] ?? pageFile;
        const loadModule = globValue;
        assertLoadModule(loadModule);
        pageFile.loadFile = async () => {
            if (!('fileExports' in pageFile)) {
                pageFile.fileExports = await loadModule();
                assertExportValues(pageFile);
            }
        };
    });
    parseGlobResult(virtualFileExportsGlobalEntry.pageFilesExportNamesLazy).forEach(({ filePath, pageFile, globValue }) => {
        pageFile = pageFilesMap[filePath] = pageFilesMap[filePath] ?? pageFile;
        const loadModule = globValue;
        assertLoadModule(loadModule);
        pageFile.loadExportNames = async () => {
            if (!('exportNames' in pageFile)) {
                const moduleExports = await loadModule();
                assert(hasProp(moduleExports, 'exportNames', 'string[]'), pageFile.filePath);
                pageFile.exportNames = moduleExports.exportNames;
            }
        };
    });
    // `pageFilesEager` contains `.page.route.js` files
    parseGlobResult(virtualFileExportsGlobalEntry.pageFilesEager).forEach(({ filePath, pageFile, globValue }) => {
        pageFile = pageFilesMap[filePath] = pageFilesMap[filePath] ?? pageFile;
        const moduleExports = globValue;
        assert(isObject(moduleExports));
        pageFile.fileExports = moduleExports;
    });
    parseGlobResult(virtualFileExportsGlobalEntry.pageFilesExportNamesEager).forEach(({ filePath, pageFile, globValue }) => {
        pageFile = pageFilesMap[filePath] = pageFilesMap[filePath] ?? pageFile;
        const moduleExports = globValue;
        assert(isObject(moduleExports));
        assert(hasProp(moduleExports, 'exportNames', 'string[]'), pageFile.filePath);
        pageFile.exportNames = moduleExports.exportNames;
    });
    virtualFileExportsGlobalEntry.pageFilesList.forEach((filePath) => {
        pageFilesMap[filePath] = pageFilesMap[filePath] ?? getPageFileObject(filePath);
    });
    const pageFilesAll = Object.values(pageFilesMap);
    pageFilesAll.forEach(({ filePath }) => {
        assert(!filePath.includes('\\'));
    });
    return { pageFilesAll, pageConfigs, pageConfigGlobal };
}
function parseGlobResult(globObject) {
    const ret = [];
    Object.entries(globObject).forEach(([fileType, globFiles]) => {
        cast(fileType);
        assert(fileTypes.includes(fileType));
        assert(isObject(globFiles));
        Object.entries(globFiles).forEach(([filePath, globValue]) => {
            const pageFile = getPageFileObject(filePath);
            assert(pageFile.fileType === fileType);
            ret.push({ filePath, pageFile, globValue });
        });
    });
    return ret;
}
function assertLoadModule(globValue) {
    assert(isCallable(globValue));
}
function assertPageConfigsSerialized(pageConfigsSerialized) {
    assert(isArray(pageConfigsSerialized));
    pageConfigsSerialized.forEach((pageConfigSerialized) => {
        assert(isObject(pageConfigSerialized));
        assert(hasProp(pageConfigSerialized, 'pageId', 'string'));
        assert(hasProp(pageConfigSerialized, 'routeFilesystem'));
        assert(hasProp(pageConfigSerialized, 'configValuesSerialized'));
    });
}
function assertPageConfigGlobalSerialized(pageConfigGlobalSerialized) {
    assert(hasProp(pageConfigGlobalSerialized, 'configValuesSerialized'));
}
