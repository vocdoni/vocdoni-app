export { pluginAssertFileEnv };
import { capitalizeFirstLetter } from '../../../utils/capitalizeFirstLetter.js';
import { applyDev } from '../../../utils/isDev.js';
import { isFilePathAbsolute } from '../../../utils/isFilePathAbsoluteFilesystem.js';
import { rollupSourceMapRemove } from '../../../utils/rollupSourceMap.js';
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { joinEnglish } from '../../../utils/joinEnglish.js';
import { extractAssetsRE } from './pluginExtractAssets.js';
import { extractExportNamesRE } from './pluginExtractExportNames.js';
import pc from '@brillout/picocolors';
import { getFilePathToShowToUserModule } from '../shared/getFilePath.js';
import { getExportNames } from '../shared/parseEsModule.js';
import { normalizeId } from '../shared/normalizeId.js';
import { isV1Design } from '../shared/resolveVikeConfigInternal.js';
import { isViteServerSide, isViteServerSide_extraSafe } from '../shared/isViteServerSide.js';
import { suffixesAssertFileEnv } from '../../../shared-server-node/getFileSuffixes.js';
import '../assertEnvVite.js';
const envS = suffixesAssertFileEnv;
// === Rolldown filter
const skipNodeModules = '/node_modules/'; // Only assert `.server.js`, `.client.js` and `.ssr.js` for user files
const filterRolldown = {
    id: {
        include: envS.map((env) => `**/*${getSuffix(env)}*`),
        exclude: [`**${skipNodeModules}**`],
    },
};
const filterFunction = (id) => {
    if (id.includes(skipNodeModules))
        return false;
    return envS.some((suffix) => id.includes(getSuffix(suffix)));
};
// ===
function pluginAssertFileEnv() {
    let config;
    let viteDevServer;
    return [
        {
            name: 'vike:pluginAssertFileEnv:dev',
            // In build, we use generateBundle() instead of the load() hook. Using load() works for dynamic imports in dev thanks to Vite's lazy transpiling, but it doesn't work in build because Rollup transpiles any dynamically imported module even if it's never actually imported.
            apply: applyDev,
            load: {
                filter: filterRolldown,
                handler(id, options) {
                    assert(viteDevServer);
                    if (!isV1Design())
                        return;
                    if (skip(id, config.root))
                        return;
                    // For `.vue` files: https://github.com/vikejs/vike/issues/1912#issuecomment-2394981475
                    if (id.endsWith('?direct'))
                        id = id.slice(0, -1 * '?direct'.length);
                    const moduleInfo = viteDevServer.moduleGraph.getModuleById(id);
                    /* It can fail, no clue why — https://github.com/vikejs/vike/issues/2740
                    assert(moduleInfo, { moduleId })
                    */
                    const importers = (!moduleInfo ? [] : Array.from(moduleInfo.importers))
                        .map((m) => m.id)
                        .filter((id) => id !== null);
                    assertFileEnv(id, isViteServerSide_extraSafe(config, this.environment, options), importers, 
                    // In dev, we only show a warning because we don't want to disrupt when the user plays with settings such as [ssr](https://vike.dev/ssr).
                    true);
                },
            },
            configureServer: {
                handler(viteDevServer_) {
                    viteDevServer = viteDevServer_;
                },
            },
            configResolved: {
                handler(config_) {
                    config = config_;
                },
            },
        },
        {
            name: 'vike:pluginAssertFileEnv:build',
            // In dev, only using load() is enough as it also works for dynamic imports (see sibling comment).
            apply: 'build',
            // In production, we have to use transform() to replace modules with a runtime error because generateBundle() doesn't work for dynamic imports. In production, dynamic imports can only be verified at runtime.
            transform: {
                filter: filterRolldown,
                async handler(code, id, options) {
                    id = normalizeId(id);
                    if (skip(id, config.root))
                        return;
                    const isServerSide = isViteServerSide_extraSafe(config, this.environment, options);
                    if (!isWrongEnv(id, isServerSide))
                        return;
                    const { importers } = this.getModuleInfo(id);
                    // Throwing a verbose error doesn't waste client-side KBs as dynamic imports are code split.
                    const errMsg = getErrMsg(id, isServerSide, importers, false, config, true);
                    // We have to inject empty exports to avoid Rollup complaining about missing exports, see https://gist.github.com/brillout/5ea45776e65bd65100a52ecd7bfda3ff
                    const { exportNames } = await getExportNames(code);
                    return rollupSourceMapRemove([
                        `throw new Error(${JSON.stringify(errMsg)});`,
                        ...exportNames.map((name) => name === 'default' ? 'export default undefined;' : `export const ${name} = undefined;`),
                    ].join('\n'));
                },
            },
            generateBundle: {
                handler() {
                    Array.from(this.getModuleIds())
                        .filter(filterFunction)
                        .filter((id) => !skip(id, config.root))
                        .forEach((moduleId) => {
                        const mod = this.getModuleInfo(moduleId);
                        const { importers } = mod;
                        if (importers.length === 0) {
                            // Dynamic imports can only be verified at runtime
                            /* This assertion can fail: https://github.com/vikejs/vike/issues/2227
                        assert(dynamicImporters.length > 0)
                        */
                            return;
                        }
                        assertFileEnv(moduleId, isViteServerSide(config, this.environment), importers, false);
                    });
                },
            },
            configResolved: {
                handler(config_) {
                    config = config_;
                },
            },
        },
    ];
    function assertFileEnv(moduleId, isServerSide, importers, onlyWarn) {
        if (!isWrongEnv(moduleId, isServerSide))
            return;
        const errMsg = getErrMsg(moduleId, isServerSide, importers, onlyWarn, config, false);
        if (onlyWarn) {
            assertWarning(false, errMsg, { onlyOnce: true });
        }
        else {
            assertUsage(false, errMsg);
        }
    }
}
function isWrongEnv(moduleId, isServerSide) {
    const modulePath = getModulePath(moduleId);
    if (isServerSide) {
        // On server-side, .client. is wrong
        return modulePath.includes(getSuffix('client'));
    }
    else {
        // On client-side, both .server. and .ssr. are wrong
        return modulePath.includes(getSuffix('server')) || modulePath.includes(getSuffix('ssr'));
    }
}
function getErrMsg(moduleId, isServerSide, importers, onlyWarn, config, noColor) {
    const envActual = isServerSide ? 'server' : 'client';
    const envExpect = isServerSide ? 'client' : 'server';
    const modulePath = getModulePath(moduleId);
    let modulePathPretty = getFilePathToShowToUserModule(modulePath, config);
    if (!noColor) {
        const suffix = modulePath.includes(getSuffix('ssr')) ? getSuffix('ssr') : getSuffix(envExpect);
        modulePathPretty = modulePathPretty.replaceAll(suffix, pc.bold(suffix));
    }
    let errMsg = `${capitalizeFirstLetter(envExpect)}-only file ${modulePathPretty} (https://vike.dev/file-env) imported on the ${envActual}-side`;
    {
        const importPaths = importers
            .filter((importer) => 
        // Can be Vike's virtual module: https://github.com/vikejs/vike/issues/2483
        isFilePathAbsolute(importer))
            .map((importer) => getFilePathToShowToUserModule(importer, config))
            .map((importPath) => pc.cyan(importPath));
        if (importPaths.length > 0) {
            errMsg += ` by ${joinEnglish(importPaths, 'and')}`;
        }
    }
    if (onlyWarn) {
        errMsg += ". This is potentially a security issue and Vike won't allow you to build your app for production.";
    }
    return errMsg;
}
function skip(id, userRootDir) {
    assert(filterFunction(id));
    // TO-DO/next-major-release: remove
    if (extractAssetsRE.test(id) || extractExportNamesRE.test(id))
        return true;
    if (getModulePath(id).endsWith('.css'))
        return true;
    // Skip linked dependencies
    if (!id.startsWith(userRootDir))
        return true;
    return false;
}
function getSuffix(env) {
    return `.${env}.`;
}
function getModulePath(moduleId) {
    return moduleId.split('?')[0];
}
