// Public usage
export { getVikeConfig };
// Internal usage
export { getVikeConfigInternal };
export { getVikeConfigInternalOptional };
export { setVikeConfigContext };
export { isVikeConfigContextSet };
export { reloadVikeConfig };
export { isV1Design };
export { getConfVal };
export { getConfigDefinitionOptional };
export { getVikeConfigFromCliOrEnv };
import { deepEqual } from '../../../utils/deepEqual.js';
import { assertKeys } from '../../../utils/assertKeys.js';
import { assertIsNotProductionRuntime } from '../../../utils/assertSetup.js';
import { getMostSimilar } from '../../../utils/getMostSimilar.js';
import { includes } from '../../../utils/includes.js';
import { objectEntries } from '../../../utils/objectEntries.js';
import { objectFromEntries } from '../../../utils/objectFromEntries.js';
import { objectKeys } from '../../../utils/objectKeys.js';
import { makeLast } from '../../../utils/sorter.js';
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { checkType } from '../../../utils/checkType.js';
import { genPromise } from '../../../utils/genPromise.js';
import { getGlobalObject } from '../../../utils/getGlobalObject.js';
import { hasProp } from '../../../utils/hasProp.js';
import { isCallable } from '../../../utils/isCallable.js';
import { isObject } from '../../../utils/isObject.js';
import { joinEnglish } from '../../../utils/joinEnglish.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { makeFirst, lowerFirst } from '../../../utils/sorter.js';
import { unique } from '../../../utils/unique.js';
import { assertPosixPath } from '../../../utils/path.js';
import { metaBuiltIn, } from './resolveVikeConfigInternal/metaBuiltIn.js';
import { getFileSuffixes } from '../../../shared-server-node/getFileSuffixes.js';
import { getLocationId, getFilesystemRouteString, getFilesystemRouteDefinedBy, isInherited, sortAfterInheritanceOrder, applyFilesystemRoutingRootEffect, } from './resolveVikeConfigInternal/filesystemRouting.js';
import { getViteDevServer, vikeConfigErrorRecoverMsg } from '../../../server/runtime/globalContext.js';
import { logConfigInfo, logErrorServerDev } from './loggerDev.js';
import { swallowViteLogForceOptimization_enable, swallowViteLogForceOptimization_disable } from './loggerVite.js';
import pc from '@brillout/picocolors';
import { getConfigDefinedAt, getDefinedByString, } from '../../../shared-server-client/page-configs/getConfigDefinedAt.js';
import { loadPointerImport, loadValueFile } from './resolveVikeConfigInternal/loadFileAtConfigTime.js';
import { resolvePointerImport } from './resolveVikeConfigInternal/resolvePointerImport.js';
import { getFilePathResolved } from './getFilePath.js';
import { getConfigValueBuildTime } from '../../../shared-server-client/page-configs/getConfigValueBuildTime.js';
import { resolveGlobalConfigPublic, } from '../../../shared-server-client/page-configs/resolveVikeConfigPublic.js';
import { getConfigValuesBase, isJsonValue, } from '../../../shared-server-client/page-configs/serialize/serializeConfigValues.js';
import { getPlusFilesByLocationId, } from './resolveVikeConfigInternal/getPlusFilesByLocationId.js';
import { getEnvVarObject } from './getEnvVarObject.js';
import { getVikeApiOperation } from '../../../shared-server-node/api-context.js';
import { getCliOptions } from '../../cli/context.js';
import { resolvePrerenderConfigGlobal } from '../../prerender/resolvePrerenderConfig.js';
import { getPublicProxy } from '../../../shared-server-client/getPublicProxy.js';
import { setVikeConfigError } from '../../../shared-server-node/getVikeConfigError.js';
import '../assertEnvVite.js';
assertIsNotProductionRuntime();
const globalObject = getGlobalObject('vite/shared/resolveVikeConfigInternal.ts', {
    restartViteBecauseOfError: false,
    vikeConfigHasBuildError: null,
    isV1Design_: null,
    vikeConfigPromise: null,
    // TO-DO/next-major-release: remove
    vikeConfigSync: null,
    vikeConfigCtx: null, // Information provided by Vite's `config` and Vike's CLI. We could, if we want or need to, completely remove the dependency on Vite.
    prerenderContext: null,
});
function reloadVikeConfig() {
    assert(globalObject.vikeConfigCtx);
    const { userRootDir, vikeVitePluginOptions } = globalObject.vikeConfigCtx;
    assert(vikeVitePluginOptions);
    resolveVikeConfigInternal_withErrorHandling(userRootDir, true, vikeVitePluginOptions);
}
async function getVikeConfigInternal(
// I don't remember the logic behind it — neither why we restart Vite's dev server, nor why we sometimes don't.
// TO-DO/eventually: re-think all that. Some + settings are expected to influence Vite's config (restarting Vite's dev server is needed) while some don't.
doNotRestartViteOnError = false) {
    assert(globalObject.vikeConfigCtx);
    const { userRootDir, isDev, vikeVitePluginOptions } = globalObject.vikeConfigCtx;
    const vikeConfig = await getOrResolveVikeConfig(userRootDir, isDev, vikeVitePluginOptions, doNotRestartViteOnError);
    return vikeConfig;
}
// TO-DO/eventually: this maybe(/probably?) isn't safe against race conditions upon file changes in development, thus:
// - Like getGlobalContext() and getGlobalContextSync() — make getVikeConfig() async and provide a getVikeConfigSync() while discourage using it
// Public usage
/**
 * Get all the information Vike knows about the app in your Vite plugin.
 *
 * https://vike.dev/getVikeConfig
 */
function getVikeConfig(
// TO-DO/next-major-release: remove
/** @deprecated the `config` argument isn't needed anymore — remove it (it doesn't have any effect) */
_config) {
    /* TO-DO/eventually: add deprecation warning. We don't do it yet because of vike-server and vike-cloudflare which are using getVikeConfig() with the argument.
    assertWarning(
      config === undefined,
      `getVikeConfig() doesn't accept any argument anymore — remove the argument (it doesn't have any effect)`,
      { onlyOnce: true, showStackTrace: true },
    )
    */
    assert(globalObject.vikeConfigSync);
    const vikeConfig = globalObject.vikeConfigSync;
    assertUsage(vikeConfig, 'getVikeConfig() can only be used when Vite is loaded (i.e. during development or build) — Vite is never loaded in production.');
    const vikeConfigPublic = getPublicProxy(vikeConfig, 'vikeConfig');
    return vikeConfigPublic;
}
function setVikeConfigContext(vikeConfigCtx_) {
    // If the user changes Vite's `config.root` => Vite completely reloads itself => setVikeConfigContext() is called again
    globalObject.vikeConfigCtx = vikeConfigCtx_;
}
function isVikeConfigContextSet() {
    return !!globalObject.vikeConfigCtx;
}
async function getOrResolveVikeConfig(userRootDir, isDev, vikeVitePluginOptions, doNotRestartViteOnError) {
    if (!globalObject.vikeConfigPromise) {
        resolveVikeConfigInternal_withErrorHandling(userRootDir, isDev, vikeVitePluginOptions, doNotRestartViteOnError);
    }
    assert(globalObject.vikeConfigPromise);
    const vikeConfig = await globalObject.vikeConfigPromise;
    return vikeConfig;
}
async function getVikeConfigInternalOptional() {
    if (!globalObject.vikeConfigPromise)
        return null;
    const vikeConfig = await globalObject.vikeConfigPromise;
    return vikeConfig;
}
function isV1Design() {
    assert(typeof globalObject.isV1Design_ === 'boolean');
    return globalObject.isV1Design_;
}
async function resolveVikeConfigInternal_withErrorHandling(userRootDir, isDev, vikeVitePluginOptions, doNotRestartViteOnError) {
    const { promise, resolve, reject } = genPromise();
    globalObject.vikeConfigPromise = promise;
    const esbuildCache = {
        transpileCache: {},
        vikeConfigDependencies: new Set(),
    };
    const vikeConfigOld = globalObject.vikeConfigSync;
    let hasError = false;
    let ret;
    let err;
    try {
        ret = await resolveVikeConfigInternal(userRootDir, vikeVitePluginOptions, esbuildCache);
    }
    catch (err_) {
        hasError = true;
        err = err_;
    }
    // There is a newer call — let the new call supersede the old one.
    // We deliberately swallow the intermetidate state (including any potential error) — it's now outdated and has existed only for a very short period of time.
    if (globalObject.vikeConfigPromise !== promise) {
        // vikeConfigPromise.then(resolve).catch(reject)
        try {
            resolve(await globalObject.vikeConfigPromise);
        }
        catch (err) {
            reject(err);
        }
        return;
    }
    if (!hasError) {
        assert(ret);
        assert(err === undefined);
        const hadError = globalObject.vikeConfigHasBuildError;
        globalObject.vikeConfigHasBuildError = false;
        setVikeConfigError({ errorBuild: false });
        let viteRestarted = false;
        if (hadError) {
            logConfigInfo(vikeConfigErrorRecoverMsg, 'error-resolve');
            if (globalObject.restartViteBecauseOfError) {
                globalObject.restartViteBecauseOfError = false;
                restartViteDevServer();
                viteRestarted = true;
            }
        }
        if (!viteRestarted && isDev && hasViteConfigChanged(vikeConfigOld, ret)) {
            restartViteDevServer();
        }
        resolve(ret);
    }
    else {
        assert(ret === undefined);
        assert(err);
        globalObject.vikeConfigHasBuildError = true;
        setVikeConfigError({ errorBuild: { err } });
        if (!doNotRestartViteOnError)
            globalObject.restartViteBecauseOfError = true;
        if (!isDev) {
            reject(err);
        }
        else {
            logErrorServerDev(err, null);
            resolve(await getVikeConfigDummy(esbuildCache));
        }
    }
}
// `+meta.vite: true` => restart Vite if config changes
function hasViteConfigChanged(vikeConfigOld, vikeConfigNew) {
    if (!vikeConfigOld)
        return false;
    const configDefinitions = vikeConfigNew._pageConfigGlobal.configDefinitions;
    const viteConfigNames = Object.keys(configDefinitions).filter((configName) => configDefinitions[configName].vite);
    const configValuesOld = getConfigValues(vikeConfigOld._pageConfigGlobal, true);
    const configValuesNew = getConfigValues(vikeConfigNew._pageConfigGlobal, true);
    for (const configName of viteConfigNames) {
        const valOld = configValuesOld[configName]?.value;
        const valNew = configValuesNew[configName]?.value;
        // Works thanks to the import() cache, see executeFile()
        // https://github.com/vikejs/vike/blob/0a4f54ff3eea128cbd886c0ac88972e44a74cf99/packages/vike/src/node/vite/shared/resolveVikeConfigInternal/transpileAndExecuteFile.ts#L386
        if (!deepEqual(valOld, valNew))
            return true;
    }
    return false;
}
async function resolveVikeConfigInternal(userRootDir, vikeVitePluginOptions, esbuildCache) {
    const plusFilesByLocationId = await getPlusFilesByLocationId(userRootDir, esbuildCache);
    const configDefinitionsResolved = await resolveConfigDefinitions(plusFilesByLocationId, userRootDir, esbuildCache);
    const { pageConfigGlobal, pageConfigs } = getPageConfigsBuildTime(configDefinitionsResolved, plusFilesByLocationId, userRootDir);
    if (!globalObject.isV1Design_)
        globalObject.isV1Design_ = pageConfigs.length > 0;
    // Backwards compatibility for vike(options) in vite.config.js
    temp_interopVikeVitePlugin(pageConfigGlobal, vikeVitePluginOptions, userRootDir);
    setCliAndApiOptions(pageConfigGlobal, configDefinitionsResolved);
    const globalConfigPublic = resolveGlobalConfig(pageConfigGlobal, pageConfigs);
    const prerenderContext = await resolvePrerenderContext({
        config: globalConfigPublic.config,
        _from: globalConfigPublic._from,
        _pageConfigs: pageConfigs,
    });
    const _extensions = Object.values(plusFilesByLocationId)
        .flat()
        .filter((p) => p.isConfigFile && p.isExtensionConfig);
    const vikeConfig = {
        ...globalConfigPublic,
        prerenderContext,
        _pageConfigs: pageConfigs,
        _pageConfigGlobal: pageConfigGlobal,
        _vikeConfigDependencies: esbuildCache.vikeConfigDependencies,
        _extensions,
    };
    globalObject.vikeConfigSync = vikeConfig;
    return vikeConfig;
}
function resolveGlobalConfig(pageConfigGlobal, pageConfigs) {
    const globalConfigPublic = resolveGlobalConfigPublic(pageConfigs, pageConfigGlobal, getConfigValues);
    return globalConfigPublic;
}
async function resolveConfigDefinitions(plusFilesByLocationId, userRootDir, esbuildCache) {
    const plusFilesByLocationIdOrdered = Object.values(plusFilesByLocationId)
        .flat()
        .sort((plusFile1, plusFile2) => sortAfterInheritanceOrderGlobal(plusFile1, plusFile2, plusFilesByLocationId, null));
    const configDefinitionsGlobal = getConfigDefinitions(
    // We use `plusFilesByLocationId` in order to allow non-global Vike extensions to create global configs, and to set the value of global configs such as `+vite` (enabling Vike extensions to add Vite plugins).
    plusFilesByLocationIdOrdered, (configDef) => !!configDef.global);
    await loadCustomConfigBuildTimeFiles(plusFilesByLocationId, configDefinitionsGlobal, userRootDir, esbuildCache);
    const configDefinitionsAll = getConfigDefinitions(Object.values(plusFilesByLocationId).flat());
    const configNamesKnownAll = Object.keys(configDefinitionsAll);
    const configNamesKnownGlobal = Object.keys(configDefinitionsGlobal);
    assert(configNamesKnownGlobal.every((configName) => configNamesKnownAll.includes(configName)));
    const configDefinitionsLocal = {};
    await Promise.all(objectEntries(plusFilesByLocationId).map(async ([locationIdPage, plusFiles]) => {
        const plusFilesRelevant = objectEntries(plusFilesByLocationId)
            .filter(([locationId]) => isInherited(locationId, locationIdPage))
            .map(([, plusFiles]) => plusFiles)
            .flat()
            .sort((plusFile1, plusFile2) => sortAfterInheritanceOrderPage(plusFile1, plusFile2, locationIdPage, null));
        const configDefinitions = getConfigDefinitions(plusFilesRelevant, (configDef) => configDef.global !== true);
        await loadCustomConfigBuildTimeFiles(plusFiles, configDefinitions, userRootDir, esbuildCache);
        const configNamesKnownLocal = unique([...Object.keys(configDefinitions), ...configNamesKnownGlobal]);
        assert(configNamesKnownLocal.every((configName) => configNamesKnownAll.includes(configName)));
        configDefinitionsLocal[locationIdPage] = {
            configDefinitions,
            plusFiles,
            plusFilesRelevant,
            configNamesKnownLocal,
        };
    }));
    const configDefinitionsResolved = {
        configDefinitionsGlobal,
        configDefinitionsLocal,
        configDefinitionsAll,
        configNamesKnownAll,
        configNamesKnownGlobal,
    };
    assertKnownConfigs(configDefinitionsResolved);
    return configDefinitionsResolved;
}
// Load value files (with `env.config===true`) of *custom* configs.
// - The value files of *built-in* configs are already loaded at `getPlusFilesByLocationId()`.
async function loadCustomConfigBuildTimeFiles(plusFiles, configDefinitions, userRootDir, esbuildCache) {
    const plusFileList = Object.values(plusFiles).flat(1);
    await Promise.all(plusFileList.map(async (plusFile) => {
        if (!plusFile.isConfigFile) {
            await loadValueFile(plusFile, configDefinitions, userRootDir, esbuildCache);
        }
        else {
            await Promise.all(Object.entries(plusFile.pointerImportsByConfigName).map(async ([configName, pointerImports]) => {
                await Promise.all(pointerImports.map((pointerImport) => loadPointerImport(pointerImport, userRootDir, configName, configDefinitions, esbuildCache)));
            }));
        }
    }));
}
function getPageConfigsBuildTime(configDefinitionsResolved, plusFilesByLocationId, userRootDir) {
    const pageConfigGlobal = {
        configDefinitions: configDefinitionsResolved.configDefinitionsGlobal,
        configValueSources: {},
    };
    objectEntries(configDefinitionsResolved.configDefinitionsGlobal).forEach(([configName, configDef]) => {
        const sources = resolveConfigValueSources(configName, configDef, 
        // We use `plusFilesByLocationId` in order to allow non-global Vike extensions to create global configs, and to set the value of global configs such as `+vite` (enabling Vike extensions to add Vite plugins).
        Object.values(plusFilesByLocationId).flat(), userRootDir, true, plusFilesByLocationId);
        if (sources.length === 0)
            return;
        pageConfigGlobal.configValueSources[configName] = sources;
    });
    applyEffects(pageConfigGlobal.configValueSources, configDefinitionsResolved.configDefinitionsGlobal, plusFilesByLocationId);
    sortConfigValueSources(pageConfigGlobal.configValueSources, null);
    assertPageConfigGlobal(pageConfigGlobal, plusFilesByLocationId);
    const pageConfigs = objectEntries(configDefinitionsResolved.configDefinitionsLocal)
        .filter(([_locationId, { plusFiles }]) => isDefiningPage(plusFiles))
        .map(([locationId, { configDefinitions, plusFilesRelevant }]) => {
        const configDefinitionsLocal = configDefinitions;
        const configValueSources = {};
        objectEntries(configDefinitionsLocal)
            .filter(([_configName, configDef]) => configDef.global !== true)
            .forEach(([configName, configDef]) => {
            const sources = resolveConfigValueSources(configName, configDef, plusFilesRelevant, userRootDir, false, plusFilesByLocationId);
            if (sources.length === 0)
                return;
            configValueSources[configName] = sources;
        });
        const pageConfigRoute = determineRouteFilesystem(locationId, configValueSources);
        applyEffects(configValueSources, configDefinitionsLocal, plusFilesByLocationId);
        sortConfigValueSources(configValueSources, locationId);
        const pageConfig = {
            pageId: locationId,
            ...pageConfigRoute,
            configDefinitions: configDefinitionsLocal,
            plusFiles: plusFilesRelevant,
            configValueSources,
        };
        const configValuesComputed = getComputed(pageConfig);
        objectAssign(pageConfig, { configValuesComputed });
        checkType(pageConfig);
        return pageConfig;
    });
    assertPageConfigs(pageConfigs);
    return { pageConfigs, pageConfigGlobal };
}
function assertPageConfigGlobal(pageConfigGlobal, plusFilesByLocationId) {
    Object.entries(pageConfigGlobal.configValueSources).forEach(([configName, sources]) => {
        assertGlobalConfigLocation(configName, sources, plusFilesByLocationId, pageConfigGlobal.configDefinitions);
    });
}
function assertGlobalConfigLocation(configName, sources, plusFilesByLocationId, configDefinitionsGlobal) {
    // Determine existing global +config.js files
    const configFilePathsGlobal = [];
    const plusFilesGlobal = Object.values(objectFromEntries(objectEntries(plusFilesByLocationId).filter(([locationId]) => isGlobalLocation(locationId, plusFilesByLocationId)))).flat();
    plusFilesGlobal
        .filter((i) => i.isConfigFile)
        .forEach((plusFile) => {
        const { filePathAbsoluteUserRootDir } = plusFile.filePath;
        if (filePathAbsoluteUserRootDir) {
            configFilePathsGlobal.push(filePathAbsoluteUserRootDir);
        }
    });
    // Call assertWarning()
    sources.forEach((source) => {
        const { plusFile } = source;
        // It's `null` when the config is defined by `vike(options)` in vite.config.js
        assert(plusFile);
        const { filePathAbsoluteUserRootDir } = plusFile.filePath;
        // Allow non-global Vike extensions to set global configs (`filePathAbsoluteUserRootDir===null` for Vike extension)
        if (!filePathAbsoluteUserRootDir)
            return;
        assert(!plusFile.isExtensionConfig);
        if (!isGlobalLocation(source.locationId, plusFilesByLocationId)) {
            const configDef = configDefinitionsGlobal[configName];
            assert(configDef);
            const isConditionallyGlobal = isCallable(configDef.global);
            const errBeg = `${filePathAbsoluteUserRootDir} (which is a non-global config file) sets the config ${pc.cyan(configName)}`;
            const errMid = !isConditionallyGlobal
                ? "but it's a global config"
                : 'to a value that is global';
            const what = isConditionallyGlobal ? 'global values' : pc.cyan(configName);
            const errEnd = configFilePathsGlobal.length > 0
                ? `define ${what} at a global config file such as ${joinEnglish(configFilePathsGlobal.map(pc.bold), 'or')} instead`
                : `create a global config file (e.g. /pages/+config.js) and define ${what} there instead`;
            // When updating this error message => also update error message at https://vike.dev/warning/global-config
            const errMsg = `${errBeg} ${errMid}: ${errEnd} (https://vike.dev/warning/global-config).`;
            assertWarning(false, errMsg, { onlyOnce: true });
        }
    });
}
function assertPageConfigs(pageConfigs) {
    pageConfigs.forEach((pageConfig) => {
        assertOnBeforeRenderEnv(pageConfig);
    });
}
function assertOnBeforeRenderEnv(pageConfig) {
    const onBeforeRenderConfig = pageConfig.configValueSources.onBeforeRender?.[0];
    if (!onBeforeRenderConfig)
        return;
    const onBeforeRenderEnv = onBeforeRenderConfig.configEnv;
    const isClientRouting = getConfigValueBuildTime(pageConfig, 'clientRouting', 'boolean');
    // When using Server Routing, loading a onBeforeRender() hook on the client-side hasn't any effect (the Server Routing's client runtime never calls it); it unnecessarily bloats client bundle sizes
    assertUsage(!(onBeforeRenderEnv.client && !isClientRouting), `Page ${pageConfig.pageId} has an onBeforeRender() hook with env ${pc.cyan(JSON.stringify(onBeforeRenderEnv))} which doesn't make sense because the page is using Server Routing: onBeforeRender() can be run in the client only when using Client Routing.`);
}
function getConfigValues(pageConfig, isGlobalConfig) {
    const tolerateMissingValue = !isGlobalConfig;
    const configValues = {};
    getConfigValuesBase(pageConfig, { isForConfig: true }, null).forEach((entry) => {
        if (entry.configValueBase.type === 'computed') {
            assert('value' in entry); // Help TS
            const { configValueBase, value, configName } = entry;
            configValues[configName] = { ...configValueBase, value };
        }
        if (entry.configValueBase.type === 'standard') {
            assert('sourceRelevant' in entry); // Help TS
            const { configValueBase, sourceRelevant, configName } = entry;
            if (!sourceRelevant.valueIsLoaded) {
                if (tolerateMissingValue)
                    return;
                assert(false);
            }
            const { value } = sourceRelevant;
            configValues[configName] = { ...configValueBase, value };
        }
        if (entry.configValueBase.type === 'cumulative') {
            assert('sourcesRelevant' in entry); // Help TS
            const { configValueBase, sourcesRelevant, configName } = entry;
            const values = [];
            sourcesRelevant.forEach((source) => {
                if (!source.valueIsLoaded) {
                    if (tolerateMissingValue)
                        return;
                    assert(false);
                }
                values.push(source.value);
            });
            if (values.length === 0) {
                if (tolerateMissingValue)
                    return;
                assert(false);
            }
            configValues[configName] = { ...configValueBase, value: values };
        }
    });
    return configValues;
}
function temp_interopVikeVitePlugin(pageConfigGlobal, vikeVitePluginOptions, userRootDir) {
    assert(isObject(vikeVitePluginOptions));
    assertWarning(Object.keys(vikeVitePluginOptions).length === 0, `Define Vike settings in +config.js instead of vite.config.js ${pc.underline('https://vike.dev/migration/settings')}`, { onlyOnce: true });
    Object.entries(vikeVitePluginOptions).forEach(([configName, value]) => {
        var _a;
        const sources = ((_a = pageConfigGlobal.configValueSources)[configName] ?? (_a[configName] = []));
        sources.push(getSourceNonConfigFile(configName, value, {
            ...getFilePathResolved({
                userRootDir,
                filePathAbsoluteUserRootDir: '/vite.config.js',
            }),
            fileExportPathToShowToUser: null,
        }));
    });
}
function setCliAndApiOptions(pageConfigGlobal, configDefinitionsResolved) {
    // Vike API — passed options [lowest precedence]
    const vikeApiOperation = getVikeApiOperation();
    if (vikeApiOperation?.options.vikeConfig) {
        addSources(vikeApiOperation.options.vikeConfig, { definedBy: 'api', operation: vikeApiOperation.operation }, false);
    }
    const { configFromCliOptions, configFromEnvVar } = getVikeConfigFromCliOrEnv();
    // Vike CLI options
    if (configFromCliOptions) {
        addSources(configFromCliOptions, { definedBy: 'cli' }, true);
    }
    // VIKE_CONFIG [highest precedence]
    if (configFromEnvVar) {
        addSources(configFromEnvVar, { definedBy: 'env' }, false);
    }
    return;
    function addSources(configValues, definedBy, exitOnError) {
        Object.entries(configValues).forEach(([configName, value]) => {
            var _a;
            const sourceName = `The ${getDefinedByString(definedBy, configName)}`;
            assertKnownConfig(configName, configDefinitionsResolved.configNamesKnownGlobal, configDefinitionsResolved, '/', false, sourceName, exitOnError);
            const sources = ((_a = pageConfigGlobal.configValueSources)[configName] ?? (_a[configName] = []));
            sources.unshift(getSourceNonConfigFile(configName, value, definedBy));
        });
    }
}
function getVikeConfigFromCliOrEnv() {
    const configFromCliOptions = getCliOptions();
    const configFromEnvVar = getEnvVarObject('VIKE_CONFIG');
    const vikeConfigFromCliOrEnv = {
        ...configFromCliOptions, // Lower precedence
        ...configFromEnvVar, // Higher precedence
    };
    return {
        vikeConfigFromCliOrEnv,
        configFromCliOptions,
        configFromEnvVar,
    };
}
function getSourceNonConfigFile(configName, value, definedAt) {
    assert(includes(objectKeys(metaBuiltIn), configName));
    const configDef = metaBuiltIn[configName];
    const source = {
        valueIsLoaded: true,
        value,
        configEnv: configDef.env,
        definedAt,
        locationId: '/',
        plusFile: null,
        valueLoadedViaImport: false,
        valueIsDefinedByPlusValueFile: false,
    };
    return source;
}
function sortConfigValueSources(configValueSources, locationIdPage) {
    Object.entries(configValueSources).forEach(([configName, sources]) => {
        sources
            .sort((source1, source2) => {
            if (!source1.plusFile || !source2.plusFile)
                return 0;
            const isGlobal = !locationIdPage;
            if (isGlobal) {
                return sortAfterInheritanceOrderGlobal(source1.plusFile, source2.plusFile, null, configName);
            }
            else {
                return sortAfterInheritanceOrderPage(source1.plusFile, source2.plusFile, locationIdPage, configName);
            }
        })
            // TO-DO/next-major-release: remove
            // Interop with vike(options) in vite.config.js — make it least precedence.
            .sort(makeLast((source) => !source.plusFile));
    });
}
function sortAfterInheritanceOrderPage(plusFile1, plusFile2, locationIdPage, configName) {
    {
        const ret = sortAfterInheritanceOrder(plusFile1.locationId, plusFile2.locationId, locationIdPage);
        if (ret !== 0)
            return ret;
        assert(plusFile1.locationId === plusFile2.locationId);
    }
    if (configName) {
        const ret = sortPlusFilesSameLocationId(plusFile1, plusFile2, configName);
        if (ret !== 0)
            return ret;
    }
    return 0;
}
function sortAfterInheritanceOrderGlobal(plusFile1, plusFile2, plusFilesByLocationId, configName) {
    if (plusFilesByLocationId) {
        const ret = makeFirst((plusFile) => isGlobalLocation(plusFile.locationId, plusFilesByLocationId))(plusFile1, plusFile2);
        if (ret !== 0)
            return ret;
    }
    {
        const ret = lowerFirst((plusFile) => plusFile.locationId.split('/').length)(plusFile1, plusFile2);
        if (ret !== 0)
            return ret;
    }
    if (plusFile1.locationId !== plusFile2.locationId) {
        // Same as `sort()` in `['some', 'string', 'array'].sort()`
        return plusFile1.locationId > plusFile2.locationId ? 1 : -1;
    }
    if (configName) {
        assert(plusFile1.locationId === plusFile2.locationId);
        const ret = sortPlusFilesSameLocationId(plusFile1, plusFile2, configName);
        if (ret !== 0)
            return ret;
    }
    return 0;
}
function sortPlusFilesSameLocationId(plusFile1, plusFile2, configName) {
    assert(plusFile1.locationId === plusFile2.locationId);
    assert(isDefiningConfig(plusFile1, configName));
    assert(isDefiningConfig(plusFile2, configName));
    // Config set by extensions (lowest precedence)
    {
        const ret = makeLast((plusFile) => !!plusFile.isExtensionConfig)(plusFile1, plusFile2);
        if (ret !== 0)
            return ret;
    }
    // Config set by side-export (lower precedence)
    {
        // - For example `export { frontmatter }` of `.mdx` files.
        // - This only considers side-export configs that are already loaded at build-time. (E.g. it actually doesn't consider `export { frontmatter }` of .mdx files since .mdx files are loaded only at runtime.)
        const ret = makeLast((plusFile) => !plusFile.isConfigFile &&
            // Is side-export
            plusFile.configName !== configName)(plusFile1, plusFile2);
        if (ret !== 0)
            return ret;
    }
    // Config set by +config.js
    {
        const ret = makeLast((plusFile) => plusFile.isConfigFile)(plusFile1, plusFile2);
        if (ret !== 0)
            return ret;
    }
    // Config set by +{configName}.js (highest precedence)
    // No need to make it deterministic: the overall order is already deterministic, see sortMakeDeterministic() at getPlusFilesByLocationId()
    return 0;
}
function resolveConfigValueSources(configName, configDef, plusFilesRelevant, userRootDir, isGlobal, plusFilesByLocationId) {
    let sources = plusFilesRelevant
        .filter((plusFile) => isDefiningConfig(plusFile, configName))
        .flatMap((plusFile) => getConfigValueSources(configName, plusFile, configDef, userRootDir));
    // Filter hydrid global-local configs
    if (!isCallable(configDef.global)) {
        // Already filtered
        assert((configDef.global ?? false) === isGlobal);
    }
    else {
        // We cannot filter earlier
        assert(configDef.env.config);
        sources = sources.filter((source) => {
            assert(source.configEnv.config);
            assert(source.valueIsLoaded);
            const valueIsGlobal = resolveIsGlobalValue(configDef.global, source, plusFilesByLocationId);
            return isGlobal ? valueIsGlobal : !valueIsGlobal;
        });
    }
    return sources;
}
function isDefiningConfig(plusFile, configName) {
    return getConfigNamesSetByPlusFile(plusFile).includes(configName);
}
function getConfigValueSources(configName, plusFile, configDef, userRootDir) {
    const confVal = getConfVal(plusFile, configName);
    assert(confVal);
    const configValueSourceCommon = {
        locationId: plusFile.locationId,
        plusFile,
    };
    const definedAtFilePath_ = {
        ...plusFile.filePath,
        fileExportPathToShowToUser: ['default', configName],
    };
    // +client.js
    if (configDef._valueIsFilePath) {
        let definedAtFilePath;
        let valueFilePath;
        if (plusFile.isConfigFile) {
            // Defined over pointer import
            assert(confVal.valueIsLoaded);
            const pointerImport = resolvePointerImport(confVal.value, plusFile.filePath, userRootDir, configName);
            const configDefinedAt = getConfigDefinedAt('Config', configName, definedAtFilePath_);
            assertUsage(pointerImport, `${configDefinedAt} should be an import`);
            valueFilePath = pointerImport.fileExportPath.filePathAbsoluteVite;
            definedAtFilePath = pointerImport.fileExportPath;
        }
        else {
            // Defined by value file, i.e. +{configName}.js
            assert(!plusFile.isConfigFile);
            valueFilePath = plusFile.filePath.filePathAbsoluteVite;
            definedAtFilePath = {
                ...plusFile.filePath,
                fileExportPathToShowToUser: [],
            };
        }
        const configValueSource = {
            ...configValueSourceCommon,
            valueIsLoaded: true,
            value: valueFilePath,
            valueIsFilePath: true,
            configEnv: configDef.env,
            valueLoadedViaImport: false,
            valueIsDefinedByPlusValueFile: false,
            definedAt: definedAtFilePath,
        };
        return [configValueSource];
    }
    // +config.js
    if (plusFile.isConfigFile) {
        assert(confVal.valueIsLoaded);
        // Defined over pointer import
        const pointerImport = plusFile.pointerImportsByConfigName[configName];
        if (pointerImport) {
            return pointerImport.map((pointerImport) => {
                const value = pointerImport.fileExportValueLoaded
                    ? {
                        valueIsLoaded: true,
                        value: pointerImport.fileExportValue,
                    }
                    : {
                        valueIsLoaded: false,
                    };
                const configValueSource = {
                    ...configValueSourceCommon,
                    ...value,
                    configEnv: resolveConfigEnv(configDef.env, pointerImport.fileExportPath),
                    valueLoadedViaImport: true,
                    valueIsDefinedByPlusValueFile: false,
                    definedAt: pointerImport.fileExportPath,
                };
                return configValueSource;
            });
        }
        // Defined inside +config.js
        const configValueSource = {
            ...configValueSourceCommon,
            valueIsLoaded: true,
            value: confVal.value,
            configEnv: configDef.env,
            valueLoadedViaImport: false,
            valueIsDefinedByPlusValueFile: false,
            definedAt: definedAtFilePath_,
        };
        return [configValueSource];
    }
    // Defined by value file, i.e. +{configName}.js
    if (!plusFile.isConfigFile) {
        const configEnvResolved = resolveConfigEnv(configDef.env, plusFile.filePath);
        assert(confVal.valueIsLoaded === !!configEnvResolved.config);
        const configValueSource = {
            ...configValueSourceCommon,
            ...confVal,
            configEnv: configEnvResolved,
            valueLoadedViaImport: 
            // If +{configName}.js is (also) runtime code => always load it via import (not strictly required, but seems to be a good default)
            !!configEnvResolved.client ||
                !!configEnvResolved.server ||
                // No choice: value isn't loaded at config-time
                !confVal.valueIsLoaded ||
                // No choice: value isn't serializable
                !isJsonValue(confVal.value),
            valueIsDefinedByPlusValueFile: true,
            definedAt: {
                ...plusFile.filePath,
                fileExportPathToShowToUser: configName === plusFile.configName
                    ? []
                    : // Side-effect config (e.g. `export { frontmatter }` of .md files)
                        [configName],
            },
        };
        return [configValueSource];
    }
    assert(false);
}
function isDefiningPage(plusFiles) {
    for (const plusFile of plusFiles) {
        const configNames = getConfigNamesSetByPlusFile(plusFile);
        if (configNames.some((configName) => isDefiningPageConfig(configName))) {
            return true;
        }
    }
    return false;
}
function isDefiningPageConfig(configName) {
    return ['Page', 'route'].includes(configName);
}
function resolveIsGlobalValue(configDefGlobal, source, plusFilesByLocationId) {
    assert(source.valueIsLoaded);
    let isGlobal;
    if (isCallable(configDefGlobal))
        isGlobal = configDefGlobal(source.value, {
            isGlobalLocation: isGlobalLocation(source.locationId, plusFilesByLocationId),
        });
    else
        isGlobal = configDefGlobal ?? false;
    assert(typeof isGlobal === 'boolean');
    return isGlobal;
}
function getConfigNamesSetByPlusFile(plusFile) {
    if (!plusFile.isConfigFile) {
        return [plusFile.configName];
    }
    else {
        return Object.keys(plusFile.fileExportsByConfigName);
    }
}
function getConfigDefinitions(plusFilesRelevant, filter) {
    let configDefinitions = { ...metaBuiltIn };
    // Add user-land meta configs
    plusFilesRelevant
        .slice()
        .reverse()
        .forEach((plusFile) => {
        const confVal = getConfVal(plusFile, 'meta');
        if (!confVal)
            return;
        assert(confVal.valueIsLoaded);
        const meta = confVal.value;
        assertMetaUsage(meta, `Config ${pc.cyan('meta')} defined at ${plusFile.filePath.filePathToShowToUser}`);
        // Set configDef._userEffectDefinedAtFilePath
        Object.entries(meta).forEach(([configName, configDef]) => {
            if ('isDefinedByPeerDependency' in configDef)
                return;
            if (!configDef.effect)
                return;
            assert(plusFile.isConfigFile);
            configDef._userEffectDefinedAtFilePath = {
                ...plusFile.filePath,
                fileExportPathToShowToUser: ['default', 'meta', configName, 'effect'],
            };
        });
        objectEntries(meta).forEach(([configName, configDefinitionUserLand]) => {
            if ('isDefinedByPeerDependency' in configDefinitionUserLand) {
                /* vike-server@1.0.24 wrongfully sets `stream: { env: { config: true }, isDefinedByPeerDependency: true }`
                assert(deepEqual(Object.keys(configDefinitionUserLand), ['isDefinedByPeerDependency']))
                //*/
                if (!configDefinitions[configName]) {
                    configDefinitions[configName] = {
                        env: { client: false, server: false, config: false },
                    };
                }
                return;
            }
            // User can override an existing config definition
            configDefinitions[configName] = {
                ...configDefinitions[configName],
                ...configDefinitionUserLand,
            };
        });
    });
    if (filter) {
        configDefinitions = Object.fromEntries(Object.entries(configDefinitions).filter(([_configName, configDef]) => filter(configDef)));
    }
    return configDefinitions;
}
function assertMetaUsage(metaVal, metaConfigDefinedAt) {
    if (!isObject(metaVal)) {
        assert(metaConfigDefinedAt); // We expect internal effects to return a valid meta value
        assertUsage(false, `${metaConfigDefinedAt} has an invalid type ${pc.cyan(typeof metaVal)}: it should be an object instead.`);
    }
    objectEntries(metaVal).forEach(([configName, def]) => {
        if (!isObject(def)) {
            assert(metaConfigDefinedAt); // We expect internal effects to return a valid meta value
            assertUsage(false, `${metaConfigDefinedAt} sets ${pc.cyan(`meta.${configName}`)} to a value with an invalid type ${pc.cyan(typeof def)}: it should be an object instead.`);
        }
        if (def.isDefinedByPeerDependency)
            return;
        // env
        let configEnv;
        {
            assert(metaConfigDefinedAt); // We expect internal effects to return a valid meta value
            if (!('env' in def)) {
                assertUsage(false, `${metaConfigDefinedAt} doesn't set ${pc.cyan(`meta.${configName}.env`)} but it's required.`);
            }
            configEnv = getConfigEnvValue(def.env, `${metaConfigDefinedAt} sets ${pc.cyan(`meta.${configName}.env`)} to`);
            // Overwrite deprecated value with valid value
            // TO-DO/next-major-release: remove once support for the deprecated values is removed
            if (typeof def.env === 'string')
                def.env = configEnv;
        }
        // effect
        if ('effect' in def) {
            if (!hasProp(def, 'effect', 'function')) {
                assert(metaConfigDefinedAt); // We expect internal effects to return a valid meta value
                assertUsage(false, `${metaConfigDefinedAt} sets ${pc.cyan(`meta.${configName}.effect`)} to an invalid type ${pc.cyan(typeof def.effect)}: it should be a function instead`);
            }
            if (!configEnv.config) {
                assert(metaConfigDefinedAt); // We expect internal effects to return a valid meta value
                assertUsage(false, `${metaConfigDefinedAt} sets ${pc.cyan(`meta.${configName}.effect`)} but it's only supported if meta.${configName}.env has ${pc.cyan('{ config: true }')} (but it's ${pc.cyan(JSON.stringify(configEnv))} instead)`);
            }
        }
        // Validate if `vite: true` then `global` and `env.config`
        if (def.vite) {
            assert(metaConfigDefinedAt);
            const errMsgBegin = `${metaConfigDefinedAt} sets ${pc.cyan(`meta.${configName}.vite`)} to ${pc.cyan('true')} which requires`;
            assertUsage(def.global, `${errMsgBegin} ${pc.cyan(`meta.${configName}.global`)} to be ${pc.cyan('true')}`);
            assertUsage(configEnv.config, `${errMsgBegin} ${pc.cyan(`meta.${configName}.env.config`)} to be ${pc.cyan('true')}`);
        }
    });
}
// Test: https://github.com/vikejs/vike/blob/871a111a77d637bbd156b07be5ae728c3d595501/test/playground/pages/config-meta/effect/e2e-test.ts
function applyEffects(configValueSources, configDefinitions, plusFilesByLocationId) {
    objectEntries(configDefinitions).forEach(([configNameEffect, configDefEffect]) => {
        const sourceEffect = configValueSources[configNameEffect]?.[0];
        if (!sourceEffect)
            return;
        const effect = runEffect(configNameEffect, configDefEffect, sourceEffect);
        if (!effect)
            return;
        const configModFromEffect = effect;
        // Apply config value changes first to create sources, then meta.env changes to modify their env
        applyEffectConfVal(configModFromEffect, sourceEffect, configValueSources, configNameEffect, configDefEffect, configDefinitions, plusFilesByLocationId);
        applyEffectMetaEnv(configModFromEffect, configValueSources, configDefEffect);
    });
}
function runEffect(configName, configDef, source) {
    if (!configDef.effect)
        return null;
    // The value needs to be loaded at config time, that's why we only support effect for configs that are config-only for now.
    assertUsage(configDef.env.config, [
        `Cannot add meta.effect to ${pc.cyan(configName)} because its meta.env is ${pc.cyan(JSON.stringify(configDef.env))} but an effect can only be added to a config that has a meta.env with ${pc.cyan('{ config: true }')}.`,
    ].join(' '));
    assert(source.valueIsLoaded);
    // Call effect
    const configModFromEffect = configDef.effect({
        configValue: source.value,
        configDefinedAt: getConfigDefinedAt('Config', configName, source.definedAt),
    });
    if (!configModFromEffect)
        return null;
    return configModFromEffect;
}
function applyEffectConfVal(configModFromEffect, sourceEffect, configValueSources, configNameEffect, configDefEffect, configDefinitions, plusFilesByLocationId) {
    objectEntries(configModFromEffect).forEach(([configNameTarget, configValue]) => {
        if (configNameTarget === 'meta')
            return;
        const configDef = configDefinitions[configNameTarget];
        assert(configDef);
        assert(configDefEffect._userEffectDefinedAtFilePath);
        const configValueSource = {
            definedAt: configDefEffect._userEffectDefinedAtFilePath,
            plusFile: sourceEffect.plusFile,
            locationId: sourceEffect.locationId,
            configEnv: configDef.env,
            valueLoadedViaImport: false,
            valueIsDefinedByPlusValueFile: false,
            valueIsLoaded: true,
            value: configValue,
        };
        assert(sourceEffect.valueIsLoaded);
        const isValueGlobalSource = resolveIsGlobalValue(configDefEffect.global, sourceEffect, plusFilesByLocationId);
        const isValueGlobalTarget = resolveIsGlobalValue(configDef.global, configValueSource, plusFilesByLocationId);
        const isGlobalHumanReadable = (isGlobal) => `${isGlobal ? 'non-' : ''}global`;
        // The error message make it sound like it's an inherent limitation, it actually isn't (both ways can make senses).
        assertUsage(isValueGlobalSource === isValueGlobalTarget, `The configuration ${pc.cyan(configNameEffect)} is set to ${pc.cyan(JSON.stringify(sourceEffect.value))} which is considered ${isGlobalHumanReadable(isValueGlobalSource)}. However, it has a meta.effect that sets the configuration ${pc.cyan(configNameTarget)} to ${pc.cyan(JSON.stringify(configValue))} which is considered ${isGlobalHumanReadable(isValueGlobalTarget)}. This is contradictory: make sure the values are either both non-global or both global.`);
        configValueSources[configNameTarget] ?? (configValueSources[configNameTarget] = []);
        configValueSources[configNameTarget].push(configValueSource);
    });
}
function applyEffectMetaEnv(configModFromEffect, configValueSources, configDefEffect) {
    const notSupported = `${pc.cyan('meta.effect')} currently only supports setting the value of a config, or modifying the ${pc.cyan('meta.env')} of a config.`;
    objectEntries(configModFromEffect).forEach(([configNameTarget, configValue]) => {
        if (configNameTarget !== 'meta')
            return;
        let configDefinedAt;
        if (configDefEffect._userEffectDefinedAtFilePath) {
            configDefinedAt = getConfigDefinedAt('Config', configNameTarget, configDefEffect._userEffectDefinedAtFilePath);
        }
        else {
            configDefinedAt = null;
        }
        assertMetaUsage(configValue, configDefinedAt);
        objectEntries(configValue).forEach(([configTargetName, configTargetDef]) => {
            assert(!('isDefinedByPeerDependency' in configTargetDef));
            {
                const keys = Object.keys(configTargetDef);
                assertUsage(keys.includes('env'), notSupported);
                assertUsage(keys.length === 1, notSupported);
            }
            const envOverridden = configTargetDef.env;
            const sources = configValueSources[configTargetName];
            sources?.forEach((configValueSource) => {
                // Apply effect
                configValueSource.configEnv = envOverridden;
            });
        });
    });
}
function getComputed(pageConfig) {
    const configValuesComputed = {};
    objectEntries(pageConfig.configDefinitions).forEach(([configName, configDef]) => {
        if (!configDef._computed)
            return;
        const value = configDef._computed(pageConfig);
        if (value === undefined)
            return;
        configValuesComputed[configName] = {
            value,
            configEnv: configDef.env,
        };
    });
    return configValuesComputed;
}
// Show error message upon unknown config
function assertKnownConfigs(configDefinitionsResolved) {
    objectEntries(configDefinitionsResolved.configDefinitionsLocal).forEach(([_locationId, { configNamesKnownLocal, plusFiles }]) => {
        plusFiles.forEach((plusFile) => {
            const configNames = getConfigNamesSetByPlusFile(plusFile);
            configNames.forEach((configName) => {
                const { locationId } = plusFile;
                const sourceName = plusFile.filePath.filePathToShowToUser;
                assertKnownConfig(configName, configNamesKnownLocal, configDefinitionsResolved, locationId, true, sourceName, false);
            });
        });
    });
}
function assertKnownConfig(configName, configNamesKnownRelevant, configDefinitionsResolved, locationId, isPlusFile, sourceName, exitOnError) {
    const { configNamesKnownAll } = configDefinitionsResolved;
    if (configNamesKnownRelevant.includes(configName)) {
        assert(configNamesKnownAll.includes(configName));
        return;
    }
    const configNameColored = pc.cyan(configName);
    // Inheritance issue: config is known but isn't defined at `locationId`
    if (configNamesKnownAll.includes(configName)) {
        assertUsage(false, `${sourceName} sets the value of the config ${configNameColored} which is a custom config that is defined with ${pc.underline('https://vike.dev/meta')} at a path that doesn't apply to ${locationId} — see ${pc.underline('https://vike.dev/config#inheritance')}`, { exitOnError });
    }
    const errMsg = isPlusFile
        ? `${sourceName} sets an unknown config ${configNameColored}`
        : `${sourceName} sets an unknown Vike config, see ${pc.underline('https://vike.dev/cli')} for the list of CLI options`;
    assert(errMsg.includes(configName));
    // Missing vike-{react,vue,solid} installation
    {
        const ui = ['vike-react', 'vike-vue', 'vike-solid'];
        const knownVikeExntensionConfigs = {
            description: ui,
            favicon: ui,
            Head: ui,
            Layout: ui,
            onCreateApp: ['vike-vue'],
            title: ui,
            ssr: ui,
            stream: ui,
            Wrapper: ui,
        };
        if (configName in knownVikeExntensionConfigs) {
            const requiredVikeExtension = joinEnglish(knownVikeExntensionConfigs[configName].map((e) => pc.bold(e)), 'or');
            const errMsgEnhanced = `${errMsg}. If you want to use the configuration ${configNameColored} documented at ${pc.underline(`https://vike.dev/${configName}`)} then make sure to install ${requiredVikeExtension}. (Alternatively, you can define ${configNameColored} yourself by using ${pc.cyan('meta')}, see ${pc.underline('https://vike.dev/meta')} for more information.)`;
            assertUsage(false, errMsgEnhanced, { exitOnError });
        }
    }
    // Similarity hint
    let configNameSimilar = null;
    if (configName === 'page') {
        configNameSimilar = 'Page';
    }
    else {
        configNameSimilar = getMostSimilar(configName, configNamesKnownAll);
    }
    if (configNameSimilar) {
        assert(configNameSimilar !== configName);
        let errMsgEnhanced = `${errMsg}. Did you mean ${pc.cyan(configNameSimilar)} instead?`;
        if (configName === 'page') {
            errMsgEnhanced += ` (The name of the config ${pc.cyan('Page')} starts with a capital letter ${pc.cyan('P')} because it defines a UI component: a ubiquitous JavaScript convention is that the name of UI components start with a capital letter.)`;
        }
        assertUsage(false, errMsgEnhanced, { exitOnError });
    }
    assertUsage(false, errMsg, { exitOnError });
}
function determineRouteFilesystem(locationId, configValueSources) {
    const configName = 'filesystemRoutingRoot';
    const configFilesystemRoutingRoot = configValueSources[configName]?.[0];
    let filesystemRouteString = getFilesystemRouteString(locationId);
    if (determineIsErrorPage(filesystemRouteString)) {
        return { isErrorPage: true, routeFilesystem: undefined };
    }
    let filesystemRouteDefinedBy = getFilesystemRouteDefinedBy(locationId); // for log404()
    if (configFilesystemRoutingRoot) {
        const routingRoot = getFilesystemRoutingRootEffect(configFilesystemRoutingRoot, configName);
        if (routingRoot) {
            const { filesystemRoutingRootEffect /*, filesystemRoutingRootConfigDefinedAt*/ } = routingRoot;
            const debugInfo = { locationId, routeFilesystem: filesystemRouteString, configFilesystemRoutingRoot };
            assert(filesystemRouteString.startsWith(filesystemRoutingRootEffect.before), debugInfo);
            filesystemRouteString = applyFilesystemRoutingRootEffect(filesystemRouteString, filesystemRoutingRootEffect);
            // filesystemRouteDefinedBy = `${filesystemRouteDefinedBy} (with ${filesystemRoutingRootConfigDefinedAt})`
        }
    }
    assert(filesystemRouteString.startsWith('/'));
    const routeFilesystem = {
        routeString: filesystemRouteString,
        definedAtLocation: filesystemRouteDefinedBy,
    };
    return { routeFilesystem, isErrorPage: undefined };
}
function getFilesystemRoutingRootEffect(configFilesystemRoutingRoot, configName) {
    assert(configFilesystemRoutingRoot.configEnv.config);
    // Eagerly loaded since it's config-only
    assert(configFilesystemRoutingRoot.valueIsLoaded);
    const { value } = configFilesystemRoutingRoot;
    const configDefinedAt = getConfigDefinedAt('Config', configName, configFilesystemRoutingRoot.definedAt);
    assertUsage(typeof value === 'string', `${configDefinedAt} should be a string`);
    assertUsage(value.startsWith('/'), `${configDefinedAt} is ${pc.cyan(value)} but it should start with a leading slash ${pc.cyan('/')}`);
    const { definedAt } = configFilesystemRoutingRoot;
    assert(!definedAt.definedBy);
    const { filePathAbsoluteUserRootDir } = definedAt;
    assert(filePathAbsoluteUserRootDir);
    const before = getFilesystemRouteString(getLocationId(filePathAbsoluteUserRootDir));
    const after = value;
    const filesystemRoutingRootEffect = { before, after };
    return { filesystemRoutingRootEffect, filesystemRoutingRootConfigDefinedAt: configDefinedAt };
}
function determineIsErrorPage(routeFilesystem) {
    assertPosixPath(routeFilesystem);
    return routeFilesystem.split('/').includes('_error');
}
function getConfigEnvValue(val, errMsgIntro) {
    const errInvalidValue = `${errMsgIntro} an invalid value ${pc.cyan(JSON.stringify(val))}`;
    // Legacy outdated values
    // TO-DO/next-major-release: remove
    if (typeof val === 'string') {
        const valConverted = (() => {
            if (val === 'client-only')
                return { client: true };
            if (val === 'server-only')
                return { server: true };
            if (val === 'server-and-client')
                return { server: true, client: true };
            if (val === 'config-only')
                return { config: true };
            if (val === '_routing-lazy')
                return { server: true, client: 'if-client-routing' };
            if (val === '_routing-eager')
                return { server: true, client: 'if-client-routing', eager: true };
            assertUsage(false, errInvalidValue);
        })();
        assertWarning(false, `${errMsgIntro} ${pc.cyan(val)} which is deprecated and will be removed in the next major release`, { onlyOnce: true });
        return valConverted;
    }
    assertUsage(isObject(val), `${errMsgIntro} an invalid type ${pc.cyan(typeof val)}`);
    assertKeys(val, ['config', 'server', 'client'], `${errInvalidValue}:`);
    assertUsage(hasProp(val, 'config', 'undefined') || hasProp(val, 'config', 'boolean'), errInvalidValue);
    assertUsage(hasProp(val, 'server', 'undefined') || hasProp(val, 'server', 'boolean'), errInvalidValue);
    assertUsage(hasProp(val, 'client', 'undefined') || hasProp(val, 'client', 'boolean'), errInvalidValue);
    /* To allow users to set an eager config:
     * - Uncomment line below.
     * - Add 'eager' to assertKeys() call above.
     * - Add `eager: boolean` to ConfigEnv type.
    assertUsage(hasProp(val, 'eager', 'undefined') || hasProp(val, 'eager', 'boolean'), errInvalidValue)
    */
    return val;
}
function getConfigDefinitionOptional(configDefinitions, configName) {
    return configDefinitions[configName] ?? null;
}
function getConfVal(plusFile, configName) {
    const configNames = getConfigNamesSetByPlusFile(plusFile);
    if (!configNames.includes(configName))
        return null;
    if (plusFile.isNotLoaded)
        return { valueIsLoaded: false };
    const confVal = { value: plusFile.fileExportsByConfigName[configName], valueIsLoaded: true };
    return confVal;
}
function resolveConfigEnv(configEnv, filePath) {
    const configEnvResolved = { ...configEnv };
    if (filePath.filePathAbsoluteFilesystem) {
        const suffixes = getFileSuffixes(filePath.fileName);
        if (suffixes.includes('ssr') || suffixes.includes('server')) {
            configEnvResolved.server = true;
            configEnvResolved.client = false;
        }
        else if (suffixes.includes('client')) {
            configEnvResolved.client = true;
            configEnvResolved.server = false;
        }
        else if (suffixes.includes('shared')) {
            configEnvResolved.server = true;
            configEnvResolved.client = true;
        }
    }
    return configEnvResolved;
}
/** Whether configs defined in `locationId` apply to every page */
function isGlobalLocation(locationId, plusFilesByLocationId) {
    const locationIdsPage = objectEntries(plusFilesByLocationId)
        .filter(([_locationId, plusFiles]) => isDefiningPage(plusFiles))
        .map(([locationId]) => locationId);
    return locationIdsPage.every((locId) => isInherited(locationId, locId));
}
async function resolvePrerenderContext(vikeConfig) {
    const { isPrerenderingEnabled, isPrerenderingEnabledForAllPages } = await resolvePrerenderConfigGlobal(vikeConfig);
    globalObject.prerenderContext ?? (globalObject.prerenderContext = {
        isPrerenderingEnabled: false,
        isPrerenderingEnabledForAllPages: false,
        // Set at runPrerender()
        output: null,
        // Set at runPrerender()
        pageContexts: null,
    });
    globalObject.prerenderContext.isPrerenderingEnabled = isPrerenderingEnabled;
    globalObject.prerenderContext.isPrerenderingEnabledForAllPages = isPrerenderingEnabledForAllPages;
    return globalObject.prerenderContext;
}
function restartViteDevServer() {
    const viteDevServer = getViteDevServer();
    assert(viteDevServer);
    swallowViteLogForceOptimization_enable();
    (async () => {
        try {
            await viteDevServer.restart();
        }
        catch (err) {
            console.error('Vite restart error:');
            console.error(err);
        }
    })();
    swallowViteLogForceOptimization_disable();
}
async function getVikeConfigDummy(esbuildCache) {
    const pageConfigsDummy = [];
    const pageConfigGlobalDummy = {
        configValueSources: {},
        configDefinitions: {},
    };
    const globalConfigPublicDummy = resolveGlobalConfig(pageConfigGlobalDummy, pageConfigsDummy);
    const prerenderContextDummy = await resolvePrerenderContext({
        config: globalConfigPublicDummy.config,
        _from: globalConfigPublicDummy._from,
        _pageConfigs: pageConfigsDummy,
    });
    const vikeConfigDummy = {
        _pageConfigs: pageConfigsDummy,
        _pageConfigGlobal: {
            configDefinitions: {},
            configValueSources: {},
        },
        ...globalConfigPublicDummy,
        prerenderContext: prerenderContextDummy,
        _vikeConfigDependencies: esbuildCache.vikeConfigDependencies,
        _extensions: [],
    };
    globalObject.vikeConfigSync = vikeConfigDummy;
    globalObject.isV1Design_ = true;
    return vikeConfigDummy;
}
