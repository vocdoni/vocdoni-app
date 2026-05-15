export { getPlusFilesByLocationId };
import { assert } from '../../../../utils/assert.js';
import { metaBuiltIn } from './metaBuiltIn.js';
import { getLocationId } from './filesystemRouting.js';
import { crawlPlusFilePaths, getPlusFileValueConfigName } from './crawlPlusFilePaths.js';
import { getConfigFileExport } from './getConfigFileExport.js';
import { loadConfigFile, loadValueFile } from './loadFileAtConfigTime.js';
import { resolvePointerImport } from './resolvePointerImport.js';
import { getFilePathResolved } from '../getFilePath.js';
import { assertExtensionsConventions, assertExtensionsRequire } from './assertExtensions.js';
import '../../assertEnvVite.js';
async function getPlusFilesByLocationId(userRootDir, esbuildCache) {
    const plusFilePaths = (await crawlPlusFilePaths(userRootDir)).map(({ filePathAbsoluteUserRootDir }) => getFilePathResolved({ filePathAbsoluteUserRootDir, userRootDir }));
    const plusFilesByLocationId = {};
    await Promise.all(plusFilePaths.map(async (filePath) => {
        if (getPlusFileValueConfigName(filePath.filePathAbsoluteFilesystem) === 'config') {
            // +config.js files
            const { filePathAbsoluteUserRootDir } = filePath;
            assert(filePathAbsoluteUserRootDir);
            const { configFile, extendsConfigs } = await loadConfigFile(filePath, userRootDir, [], false, esbuildCache);
            assert(filePath.filePathAbsoluteUserRootDir);
            const locationId = getLocationId(filePathAbsoluteUserRootDir);
            const plusFile = getPlusFileFromConfigFile(configFile, false, locationId, userRootDir);
            plusFilesByLocationId[locationId] = plusFilesByLocationId[locationId] ?? [];
            plusFilesByLocationId[locationId].push(plusFile);
            extendsConfigs.forEach((extendsConfig) => {
                /* We purposely use the same locationId because the Vike extension's config should only apply to where it's being extended from, for example:
              ```js
              // /pages/admin/+config.js
      
              import vikeVue from 'vike-vue/config'
              // Should only apply to /pages/admin/**
              export default { extends: [vikeVue] }
              ```
              ```js
              // /pages/marketing/+config.js
      
              import vikeReact from 'vike-react/config'
              // Should only apply to /pages/marketing/**
              export default { extends: [vikeReact] }
              ```
              */
                const plusFile = getPlusFileFromConfigFile(extendsConfig, true, locationId, userRootDir);
                assertExtensionsConventions(plusFile);
                plusFilesByLocationId[locationId].push(plusFile);
            });
        }
        else {
            // +{configName}.js files
            const { filePathAbsoluteUserRootDir } = filePath;
            assert(filePathAbsoluteUserRootDir);
            const configName = getPlusFileValueConfigName(filePathAbsoluteUserRootDir);
            assert(configName);
            const locationId = getLocationId(filePathAbsoluteUserRootDir);
            const plusFile = {
                locationId,
                filePath,
                isConfigFile: false,
                isNotLoaded: true,
                configName,
            };
            plusFilesByLocationId[locationId] = plusFilesByLocationId[locationId] ?? [];
            plusFilesByLocationId[locationId].push(plusFile);
            // We don't have access to the custom config definitions defined by the user yet.
            //  - If `configDef` is `undefined` => we load the file +{configName}.js later.
            //  - We already need to load +meta.js here (to get the custom config definitions defined by the user)
            await loadValueFile(plusFile, metaBuiltIn, userRootDir, esbuildCache);
        }
    }));
    // Make lists element order deterministic
    Object.entries(plusFilesByLocationId).forEach(([_locationId, plusFiles]) => {
        plusFiles.sort(sortMakeDeterministic);
    });
    assertPlusFiles(plusFilesByLocationId);
    return plusFilesByLocationId;
}
function assertPlusFiles(plusFilesByLocationId) {
    const plusFiles = Object.values(plusFilesByLocationId).flat();
    // The earlier we call it the better, so that +require can be used by Vike extensions to depend on new Vike features
    assertExtensionsRequire(plusFiles);
}
function getPlusFileFromConfigFile(configFile, isExtensionConfig, locationId, userRootDir) {
    const { fileExports, filePath, extendsFilePaths } = configFile;
    const fileExportsByConfigName = {};
    const pointerImportsByConfigName = {};
    const fileExport = getConfigFileExport(fileExports, filePath.filePathToShowToUser);
    Object.entries(fileExport).forEach(([configName, configValue]) => {
        fileExportsByConfigName[configName] = configValue;
        // Pointer imports
        const values = Array.isArray(configValue) ? configValue : [configValue];
        const pointerImports = values
            .map((value) => resolvePointerImport(value, configFile.filePath, userRootDir, configName))
            .filter((pointerImport) => pointerImport !== null)
            .map((pointerImport) => ({ ...pointerImport, fileExportValueLoaded: false }));
        if (pointerImports.length > 0) {
            pointerImportsByConfigName[configName] = pointerImports;
        }
    });
    const plusFile = {
        locationId,
        filePath,
        fileExportsByConfigName,
        pointerImportsByConfigName,
        isConfigFile: true,
        isExtensionConfig,
        extendsFilePaths,
    };
    return plusFile;
}
// Make order deterministic (no other purpose)
function sortMakeDeterministic(plusFile1, plusFile2) {
    // Sort by file path
    return plusFile1.filePath.filePathAbsoluteVite < plusFile2.filePath.filePathAbsoluteVite ? -1 : 1;
}
