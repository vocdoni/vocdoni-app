// TO-DO/soon/same-api: use public API internally?
// TO-DO/soon/flat-pageContext: rename definedAt => definedBy
export { resolveGlobalConfigPublic };
export { resolvePageContextConfig };
export { resolveGlobalContextConfig };
import { assertDefaultExports, forbiddenDefaultExports } from '../getPageFiles/assert_exports_old_design.js';
import { getConfigDefinedAtOptional, getDefinedAtString } from './getConfigDefinedAt.js';
import { getConfigValueFilePathToShowToUser } from './helpers.js';
import { assert, assertWarning, assertUsage } from '../../utils/assert.js';
import { makeLast } from '../../utils/sorter.js';
import { isScriptFile, isTemplateFile } from '../../utils/isScriptFile.js';
import { objectDefineProperty } from '../../utils/objectDefineProperty.js';
import { isBrowser } from '../../utils/isBrowser.js';
import { isObject } from '../../utils/isObject.js';
import pc from '@brillout/picocolors';
function resolveGlobalConfigPublicPage(pageConfigGlobalValues, pageConfig, pageConfigValues) {
    const pageConfigPublic_ = resolvePageConfigPublic({ pageConfigGlobalValues, pageConfigValues });
    const pageConfigPublic = getPublicCopy(pageConfigPublic_);
    const page = (() => {
        if (!pageConfig.isErrorPage) {
            const route = pageConfigPublic.config.route ?? pageConfig.routeFilesystem.routeString;
            return {
                ...pageConfigPublic,
                route,
            };
        }
        else {
            return {
                ...pageConfigPublic,
                isErrorPage: true,
            };
        }
    })();
    return [pageConfig.pageId, page];
}
function getPublicCopy(configInternal) {
    const configPublic = {
        config: configInternal.config,
        // TO-DO/soon/flat-pageContext: expose publicly?
        _source: configInternal.source,
        _sources: configInternal.sources,
        _from: configInternal.from,
    };
    return configPublic;
}
function resolvePageConfigPublic({ pageConfigGlobalValues, pageConfigValues, }) {
    const configValues = { ...pageConfigGlobalValues, ...pageConfigValues };
    return resolveConfigPublic_V1Design({ configValues });
}
function resolvePageContextConfig(pageFiles, // V0.4 design
pageConfig, // V1 design
pageConfigGlobal) {
    const config = {};
    const configEntries = {}; // TO-DO/next-major-release: remove
    const exportsAll = {}; // TO-DO/next-major-release: remove
    // V0.4 design
    // TO-DO/next-major-release: remove
    pageFiles.forEach((pageFile) => {
        const exportValues = getExportValues(pageFile);
        exportValues.forEach(({ exportName, exportValue, isFromDefaultExport }) => {
            assert(exportName !== 'default');
            exportsAll[exportName] = exportsAll[exportName] ?? [];
            exportsAll[exportName].push({
                exportValue,
                exportSource: `${pageFile.filePath} > ${isFromDefaultExport ? `\`export default { ${exportName} }\`` : `\`export { ${exportName} }\``}`,
                filePath: pageFile.filePath,
                _filePath: pageFile.filePath, // TO-DO/next-major-release: remove
                _fileType: pageFile.fileType,
                _isFromDefaultExport: isFromDefaultExport,
            });
        });
    });
    let source;
    let sources;
    let from;
    if (pageConfig) {
        const res = resolvePageConfigPublic({
            pageConfigGlobalValues: pageConfigGlobal.configValues,
            pageConfigValues: pageConfig.configValues,
        });
        source = res.source;
        sources = res.sources;
        from = res.from;
        Object.assign(config, res.config);
        Object.assign(configEntries, res.configEntries);
        Object.assign(exportsAll, res.exportsAll);
    }
    else {
        source = {};
        sources = {};
        from = {
            configsStandard: {},
            configsCumulative: {},
            configsComputed: {},
        };
    }
    const pageExports = {};
    const exports = {};
    Object.entries(exportsAll).forEach(([exportName, values]) => {
        values.forEach(({ exportValue, _fileType, _isFromDefaultExport }) => {
            exports[exportName] = exports[exportName] ?? exportValue;
            // Legacy pageContext.pageExports
            if (_fileType === '.page' && !_isFromDefaultExport) {
                if (!(exportName in pageExports)) {
                    pageExports[exportName] = exportValue;
                }
            }
        });
    });
    assert(!('default' in exports));
    assert(!('default' in exportsAll));
    const pageContextAddendum = {
        config: config,
        from,
        source,
        sources,
        // TO-DO/soon/flat-pageContext: deprecate every prop below
        configEntries,
        exports,
        exportsAll,
    };
    // TO-DO/next-major-release: remove
    objectDefineProperty(pageContextAddendum, 'pageExports', {
        get: () => {
            // We only show the warning in Node.js because when using Client Routing Vue integration uses `Object.assign(pageContextReactive, pageContext)` which will wrongully trigger the warning. There is no cross-browser way to catch whether the property accessor was initiated by an `Object.assign()` call.
            if (!isBrowser()) {
                assertWarning(false, 'pageContext.pageExports is outdated, use pageContext.exports instead', {
                    onlyOnce: true,
                    showStackTrace: true,
                });
            }
            return pageExports;
        },
        enumerable: false,
        configurable: true,
    });
    return pageContextAddendum;
}
function resolveGlobalContextConfig(pageConfigs, pageConfigGlobal) {
    const globalContextAddendum = resolveGlobalConfigPublic(pageConfigs, pageConfigGlobal, (c) => c.configValues);
    return globalContextAddendum;
}
function resolveGlobalConfigPublic(pageConfigs, pageConfigGlobal, getConfigValues) {
    // global
    const pageConfigGlobalValues = getConfigValues(pageConfigGlobal, true);
    const globalConfigPublicBase_ = resolveConfigPublic_V1Design({ configValues: pageConfigGlobalValues });
    const globalConfigPublicBase = getPublicCopy(globalConfigPublicBase_);
    // pages
    const pages = Object.fromEntries(pageConfigs.map((pageConfig) => {
        const pageConfigValues = getConfigValues(pageConfig);
        return resolveGlobalConfigPublicPage(pageConfigGlobalValues, pageConfig, pageConfigValues);
    }));
    const globalConfigPublic = {
        ...globalConfigPublicBase,
        pages,
    };
    return {
        ...globalConfigPublic,
        _globalConfigPublic: globalConfigPublic,
    };
}
// V1 design
function resolveConfigPublic_V1Design(pageConfig) {
    const config = {};
    const configEntries = {};
    const exportsAll = {};
    const source = {};
    const sources = {};
    const from = {
        configsStandard: {},
        configsCumulative: {},
        configsComputed: {},
    };
    const addSrc = (src, configName) => {
        source[configName] = src;
        sources[configName] ?? (sources[configName] = []);
        sources[configName].push(src);
    };
    const addLegacy = (configName, value, definedAtData) => {
        const configValueFilePathToShowToUser = getConfigValueFilePathToShowToUser(definedAtData);
        const configDefinedAt = getConfigDefinedAtOptional('Config', configName, definedAtData);
        configEntries[configName] = configEntries[configName] ?? [];
        configEntries[configName].push({
            configValue: value,
            configDefinedAt,
            configDefinedByFile: configValueFilePathToShowToUser,
        });
        // TO-DO/next-major-release: remove
        const exportName = configName;
        exportsAll[exportName] = exportsAll[exportName] ?? [];
        exportsAll[exportName].push({
            exportValue: value,
            exportSource: configDefinedAt,
            filePath: configValueFilePathToShowToUser,
            _filePath: configValueFilePathToShowToUser,
            _fileType: null,
            _isFromDefaultExport: null,
        });
    };
    Object.entries(pageConfig.configValues).forEach(([configName, configValue]) => {
        const { value } = configValue;
        config[configName] = config[configName] ?? value;
        if (configValue.type === 'standard') {
            const src = {
                type: 'configsStandard',
                value: configValue.value,
                definedAt: getDefinedAtString(configValue.definedAtData, configName),
            };
            addSrc(src, configName);
            from.configsStandard[configName] = src;
            addLegacy(configName, value, configValue.definedAtData);
        }
        if (configValue.type === 'cumulative') {
            const src = {
                type: 'configsCumulative',
                definedAt: getDefinedAtString(configValue.definedAtData, configName),
                values: configValue.value.map((value, i) => {
                    const definedAtFile = configValue.definedAtData[i];
                    assert(definedAtFile);
                    const definedAt = getDefinedAtString(definedAtFile, configName);
                    addLegacy(configName, value, definedAtFile);
                    return {
                        value,
                        definedAt,
                    };
                }),
            };
            addSrc(src, configName);
            from.configsCumulative[configName] = src;
        }
        if (configValue.type === 'computed') {
            const src = {
                type: 'configsComputed',
                definedAt: 'Vike', // Vike currently doesn't support user-land computed configs => computed configs are always defined by Vike => there isn't any file path to show.
                value: configValue.value,
            };
            addSrc(src, configName);
            from.configsComputed[configName] = src;
            addLegacy(configName, value, configValue.definedAtData);
        }
    });
    return {
        config: config,
        configEntries,
        exportsAll,
        source,
        sources,
        from,
    };
}
// V0.4 design
// TO-DO/next-major-release: remove
function getExportValues(pageFile) {
    const { filePath, fileExports } = pageFile;
    assert(fileExports); // assume pageFile.loadFile() was called
    assert(isScriptFile(filePath));
    const exportValues = [];
    Object.entries(fileExports)
        .sort(makeLast(([exportName]) => exportName === 'default')) // `export { bla }` should override `export default { bla }`
        .forEach(([exportName, exportValue]) => {
        let isFromDefaultExport = exportName === 'default';
        if (isFromDefaultExport) {
            if (isTemplateFile(filePath)) {
                exportName = 'Page';
            }
            else {
                assertUsage(isObject(exportValue), `The ${pc.cyan('export default')} of ${filePath} should be an object.`);
                Object.entries(exportValue).forEach(([defaultExportName, defaultExportValue]) => {
                    assertDefaultExports(defaultExportName, filePath);
                    exportValues.push({
                        exportName: defaultExportName,
                        exportValue: defaultExportValue,
                        isFromDefaultExport,
                    });
                });
                return;
            }
        }
        exportValues.push({
            exportName,
            exportValue,
            isFromDefaultExport,
        });
    });
    exportValues.forEach(({ exportName, isFromDefaultExport }) => {
        assert(!(isFromDefaultExport && forbiddenDefaultExports.includes(exportName)));
    });
    return exportValues;
}
